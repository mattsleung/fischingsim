export type Scene = {
  name: string;
  subtitle: string;
  sky: [string, string];
  water: [string, string];
  cliff: string;
  near: string;
  glow: string;
  moon: boolean;
  seed: number;
};
export const SCENES: Scene[] = [
  {
    name: "Moonlit Reach",
    subtitle: "NORTHERN WATERS",
    sky: ["#0b182c", "#657586"],
    water: ["#345b6a", "#101f31"],
    cliff: "#243b47",
    near: "#102733",
    glow: "#d5e5da",
    moon: true,
    seed: 17,
  },
  {
    name: "Amber Inlet",
    subtitle: "WESTERN SHOALS",
    sky: ["#25243c", "#bd8c79"],
    water: ["#785e69", "#182837"],
    cliff: "#403b4c",
    near: "#242c3a",
    glow: "#ffd4a0",
    moon: false,
    seed: 31,
  },
  {
    name: "Emerald Sound",
    subtitle: "THE FORGOTTEN COAST",
    sky: ["#0b282e", "#769990"],
    water: ["#427c78", "#112e37"],
    cliff: "#214d4c",
    near: "#123738",
    glow: "#c4ead5",
    moon: true,
    seed: 49,
  },
];
export function chooseScene(random = Math.random): Scene {
  return SCENES[
    Math.min(SCENES.length - 1, Math.floor(random() * SCENES.length))
  ];
}
