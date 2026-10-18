import { useRouter } from 'expo-router';

type AppRouter = ReturnType<typeof useRouter>;

/** Derin bağlantıyla gelinmiş olsa bile sekmelerdeki projelere döner. */
export function goToProjects(router: AppRouter) {
  try {
    router.dismissAll();
  } catch {
    // Yığında kapatılacak ekran yoksa replace tek başına yeterlidir.
  }
  router.replace('/(tabs)/projects');
}
