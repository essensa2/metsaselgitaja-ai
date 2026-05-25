export type RealDataLayer = {
  id: string;
  name: string;
  description: string;
  url: string;
  sourceName: string;
  attribution: string;
};

export const realDataLayers: RealDataLayer[] = [
  {
    id: "korvemaa-metsaregister",
    name: "Päris Metsaregistri andmed",
    description:
      "Aegviidu / Korvemaa BBOXiga piiratud Metsaregistri eraldiste WFS näidis.",
    url: "/data/processed/korvemaa-metsaregister.geojson",
    sourceName: "Keskkonnaagentuur / Metsaregister",
    attribution: "Keskkonnaagentuur / Metsaregister WFS",
  },
];
