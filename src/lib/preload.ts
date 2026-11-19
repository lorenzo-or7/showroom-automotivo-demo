/** Import dinâmico compartilhado: usado pela rota e para pré-carregar no hover/foco dos cards. */
export const loadVehiclePage = () => import('../pages/VehiclePage');
export const loadComparePage = () => import('../pages/ComparePage');

let preloaded = false;
export function preloadVehiclePage() {
  if (preloaded) return;
  preloaded = true;
  void loadVehiclePage();
}
