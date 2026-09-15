export const WHATSAPP = 'https://wa.me/551733402000';
export const INSTAGRAM = 'https://www.instagram.com/vintagearcadeburger/';

export type CabinetCategory = 'burgers' | 'porcoes' | 'drinks' | 'eventos';

export type CatalogItem = {
  id: string;
  name: string;
  category: CabinetCategory;
  categoryLabel: string;
  description: string;
  placeholder: boolean;
};

export const CATEGORY_BUTTONS: Array<{
  id: CabinetCategory;
  key: 'A' | 'B' | 'X' | 'Y';
  label: string;
  tone: 'pink' | 'yellow' | 'blue' | 'red';
}> = [
  { id: 'burgers', key: 'A', label: 'BURGERS', tone: 'pink' },
  { id: 'porcoes', key: 'B', label: 'PORÇÕES', tone: 'yellow' },
  { id: 'drinks', key: 'X', label: 'DRINKS', tone: 'blue' },
  { id: 'eventos', key: 'Y', label: 'EVENTOS', tone: 'red' }
];

export const CATALOG: Record<CabinetCategory, CatalogItem[]> = {
  burgers: [
    {
      id: 'mortal-krispy',
      name: 'Mortal Krispy',
      category: 'burgers',
      categoryLabel: 'BURGERS',
      description: 'Sanduba lendário da casa, com personalidade arcade e crunch no ataque.',
      placeholder: true
    },
    {
      id: 'crash-costela',
      name: 'Crash Costela',
      category: 'burgers',
      categoryLabel: 'BURGERS',
      description: 'Costela suculenta em formato de boss fight — pesado, marcante e feito para a partida.',
      placeholder: true
    },
    {
      id: 'street-fraldinha',
      name: 'Street Fraldinha',
      category: 'burgers',
      categoryLabel: 'BURGERS',
      description: 'Fraldinha no modo street: direto, sabor alto e vibe de fliperama.',
      placeholder: true
    }
  ],
  porcoes: [
    {
      id: 'porcoes-select',
      name: 'Porções para compartilhar',
      category: 'porcoes',
      categoryLabel: 'PORÇÕES',
      description: 'Acompanham a partida no salão. Abra o cardápio completo para ver os itens do momento.',
      placeholder: true
    }
  ],
  drinks: [
    {
      id: 'drinks-select',
      name: 'Drinks & bebidas',
      category: 'drinks',
      categoryLabel: 'DRINKS',
      description: 'Do refrigerante ao drink da casa. Consulte o cardápio para a seleção atual.',
      placeholder: true
    }
  ],
  eventos: [
    {
      id: 'eventos-select',
      name: 'Eventos & aniversários',
      category: 'eventos',
      categoryLabel: 'EVENTOS',
      description: 'Reserve uma fase especial: aniversário, squad night ou comemoração no clima arcade.',
      placeholder: true
    }
  ]
};

export function catalogHref(item: CatalogItem): { menu: string; order: string } {
  if (item.category === 'eventos') {
    return {
      menu: `${WHATSAPP}?text=Oi%2C%20quero%20informa%C3%A7%C3%B5es%20sobre%20eventos%20na%20Vintage%20Arcade.`,
      order: `${WHATSAPP}?text=Oi%2C%20quero%20reservar%20um%20evento%20na%20Vintage%20Arcade.`
    };
  }

  const encoded = encodeURIComponent(item.name);
  return {
    menu: `${WHATSAPP}?text=Oi%2C%20quero%20ver%20o%20card%C3%A1pio%20da%20Vintage%20Arcade.`,
    order: `${WHATSAPP}?text=Oi%2C%20quero%20pedir%20${encoded}%20na%20Vintage%20Arcade.`
  };
}
