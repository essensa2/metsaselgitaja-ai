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
    id: "metsaregister-eraldis-sample",
    name: "Metsaregistri eraldised",
    description:
      "Väike WFS näidis Soomaa demoala ümbrusest. Kasutatakse ainult visuaalseks prototüübiks.",
    url: "/data/processed/metsaregister-eraldis-sample.geojson",
    sourceName: "Keskkonnaagentuur / Metsaregister",
    attribution: "Keskkonnaagentuur, Metsaregister, Keskkonnaportaal WFS",
  },
];
