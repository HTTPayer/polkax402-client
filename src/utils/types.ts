export interface PolkaNewsOutput {
  as_of: string;
  query_used: string;
  summary_markdown: string; // texto legible principal
  bullets: string[]; // puntos clave
  sources: {
    title: string;
    url: string;
    note?: string;
  }[];
}
