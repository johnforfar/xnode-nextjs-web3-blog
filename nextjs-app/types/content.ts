export interface BaseContent {
  title: string
  description?: string
}

export type HeroContent = {
  type: 'hero';
  title: string;
  description: string;
}

export type CardContent = {
  type: 'card';
  title: string;
  description: string;
  content: string;
}

export type AlertContent = {
  type: 'alert';
  title: string;
  description: string;
  variant: 'default' | 'destructive';
}

export type TabContent = {
  title: string;
  content: string;
}

export type TabsContent = {
  type: 'tabs';
  tabs: Array<{ title: string; content: string; }>;
}

export type Section = {
  id: string;
} & (
  | { type: 'hero'; content: HeroContent }
  | { type: 'card'; content: CardContent }
  | { type: 'alert'; content: AlertContent }
  | { type: 'tabs'; content: TabsContent }
)

export type PageContent = {
  pages: {
    home: {
      title: string;
      sections: Section[];
    };
  };
  navigation: {
    links: Array<{
      name: string;
      path: string;
    }>;
  };
}; 