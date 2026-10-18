import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Aspect, Clip, Project } from '@/types';
import { readJSON, STORAGE_KEYS, writeJSON } from './storage';

type ProjectsContextValue = {
  projects: Project[];
  hydrated: boolean;
  storageError: boolean;
  createProject: (clips: Clip[], aspect?: Aspect, title?: string) => Project;
  updateProject: (id: string, updater: (project: Project) => Project) => void;
  deleteProject: (id: string) => void;
  clearProjects: () => void;
  getProject: (id: string) => Project | undefined;
  reload: () => Promise<void>;
};

const ProjectsContext = createContext<ProjectsContextValue | null>(null);

export function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function isProject(value: unknown): value is Project {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<Project>;
  return (
    typeof candidate.id === 'string' &&
    Array.isArray(candidate.clips) &&
    typeof candidate.createdAt === 'number' &&
    typeof candidate.updatedAt === 'number'
  );
}

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const hydratedRef = useRef(false);

  const load = useCallback(async () => {
    try {
      const stored = await readJSON<Project[]>(STORAGE_KEYS.projects);
      if (Array.isArray(stored)) {
        setProjects(stored.filter(isProject).sort((a, b) => b.updatedAt - a.updatedAt));
      } else {
        setProjects([]);
      }
      setStorageError(false);
    } catch {
      setStorageError(true);
    } finally {
      hydratedRef.current = true;
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const reload = useCallback(async () => {
    hydratedRef.current = false;
    await load();
  }, [load]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    // Kırpma sırasında her hareket yazmasın: 300 ms'lik birleştirme.
    const timer = setTimeout(() => {
      void writeJSON(STORAGE_KEYS.projects, projects);
    }, 300);
    return () => clearTimeout(timer);
  }, [projects]);

  const createProject = useCallback((clips: Clip[], aspect: Aspect = '9:16', title = '') => {
    const now = Date.now();
    const project: Project = {
      id: createId(),
      title,
      clips,
      aspect,
      createdAt: now,
      updatedAt: now,
      status: 'draft',
    };
    setProjects((current) => [project, ...current]);
    return project;
  }, []);

  const updateProject = useCallback((id: string, updater: (project: Project) => Project) => {
    setProjects((current) =>
      current.map((project) =>
        project.id === id ? { ...updater(project), updatedAt: Date.now() } : project
      )
    );
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects((current) => current.filter((project) => project.id !== id));
  }, []);

  const clearProjects = useCallback(() => {
    setProjects([]);
  }, []);

  const getProject = useCallback(
    (id: string) => projects.find((project) => project.id === id),
    [projects]
  );

  const value = useMemo(
    () => ({
      projects,
      hydrated,
      storageError,
      createProject,
      updateProject,
      deleteProject,
      clearProjects,
      getProject,
      reload,
    }),
    [
      projects,
      hydrated,
      storageError,
      createProject,
      updateProject,
      deleteProject,
      clearProjects,
      getProject,
      reload,
    ]
  );

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error('useProjects, ProjectsProvider içinde kullanılmalıdır.');
  return ctx;
}
