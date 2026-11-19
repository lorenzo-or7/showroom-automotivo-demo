import type { VehicleImage } from './types';

/** Fotografias de detalhe da seção Experiência (Unsplash, Licença Unsplash). */
export const editorialImages = {
  headlight: { id: '1608578702177-1ea59540ac72', alt: 'Farol circular de LED aceso na dianteira de um utilitário preto fosco', ratio: 1.5, focus: '55% 50%' },
  wheel: { id: '1615125468484-088e3dfcabb6', alt: 'Volante de couro e painel de instrumentos de um esportivo, vistos do banco do motorista', ratio: 0.67, focus: '50% 50%' },
  leather: { id: '1519120433933-22bc753101f3', alt: 'Macro de banco em couro preto com costuras aparentes', ratio: 1.5, focus: '50% 50%' },
  rim: { id: '1615400369522-eecf20c01535', alt: 'Roda de cinco raios em preto e prata, vista de perto', ratio: 0.67, focus: '50% 50%' },
  taillight: { id: '1615141850457-2a422b17e282', alt: 'Farol e grade dianteira de uma perua esportiva cinza-escura, de perto', ratio: 0.56, focus: '50% 50%' },
  finale: { id: '1775407492017-cb6142214815', alt: 'Traseira de um Porsche 911 GT3 branco numa estrada ladeada de árvores', ratio: 1.5, focus: '50% 58%' },
} satisfies Record<string, VehicleImage>;
