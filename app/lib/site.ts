export const WHATSAPP = 'https://wa.me/551733402000';
export const INSTAGRAM = 'https://www.instagram.com/vintagearcadeburger/';
export const MAPS =
  'https://www.google.com/maps/search/?api=1&query=Vintage+Arcade+Rua+Dr+Tobias+Lima+1320+Bebedouro+SP';

export const HOURS = [
  ['Ter–Qui', '18h–22h30'],
  ['Sex–Sáb', '18h–23h'],
  ['Dom', '18h–22h30'],
  ['Seg', 'Fechado']
] as const;

export type CategoryId = 'burgers' | 'porcoes' | 'drinks' | 'eventos';

export type CatalogItem = {
  id: string;
  name: string;
  categoryLabel: string;
  description: string;
};

export const CATEGORIES: Array<{
  id: CategoryId;
  key: 'A' | 'B' | 'X' | 'Y';
  label: string;
  tone: 'pink' | 'yellow' | 'blue' | 'red';
}> = [
  { id: 'burgers', key: 'A', label: 'BURGERS', tone: 'pink' },
  { id: 'porcoes', key: 'B', label: 'PORÇÕES', tone: 'yellow' },
  { id: 'drinks', key: 'X', label: 'DRINKS', tone: 'blue' },
  { id: 'eventos', key: 'Y', label: 'EVENTOS', tone: 'red' }
];

export const CATALOG: Record<CategoryId, CatalogItem[]> = {
  burgers: [
    {
      id: 'mortal-krispy',
      name: 'Mortal Krispy',
      categoryLabel: 'BURGERS',
      description: 'Sanduba lendário da casa, com personalidade arcade.'
    },
    {
      id: 'crash-costela',
      name: 'Crash Costela',
      categoryLabel: 'BURGERS',
      description: 'Costela marcante, feita para uma partida completa.'
    },
    {
      id: 'street-fraldinha',
      name: 'Street Fraldinha',
      categoryLabel: 'BURGERS',
      description: 'Fraldinha no modo street: direto e sabor alto.'
    }
  ],
  porcoes: [
    {
      id: 'porcoes',
      name: 'Porções',
      categoryLabel: 'PORÇÕES',
      description: 'Para compartilhar no salão. Veja o cardápio completo no WhatsApp.'
    }
  ],
  drinks: [
    {
      id: 'drinks',
      name: 'Drinks & bebidas',
      categoryLabel: 'DRINKS',
      description: 'Do refrigerante ao drink da casa. Consulte a seleção atual.'
    }
  ],
  eventos: [
    {
      id: 'eventos',
      name: 'Eventos & aniversários',
      categoryLabel: 'EVENTOS',
      description: 'Reserve uma fase especial com comida, games e clima arcade.'
    }
  ]
};

export function itemLinks(item: CatalogItem, category: CategoryId) {
  if (category === 'eventos') {
    return {
      secondary: `${WHATSAPP}?text=${encodeURIComponent('Oi, quero informações sobre eventos na Vintage Arcade.')}`,
      primary: `${WHATSAPP}?text=${encodeURIComponent('Oi, quero reservar um evento na Vintage Arcade.')}`,
      secondaryLabel: 'VER EVENTOS',
      primaryLabel: 'CONSULTAR'
    };
  }

  return {
    secondary: `${WHATSAPP}?text=${encodeURIComponent('Oi, quero ver o cardápio da Vintage Arcade.')}`,
    primary: `${WHATSAPP}?text=${encodeURIComponent(`Oi, quero pedir ${item.name} na Vintage Arcade.`)}`,
    secondaryLabel: 'VER CARDÁPIO',
    primaryLabel: 'PEDIR'
  };
}
