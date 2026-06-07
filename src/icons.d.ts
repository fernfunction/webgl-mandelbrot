// com o compiler "raw" do unplugin-icons, cada icone e importado como string SVG
declare module "~icons/*" {
  const svg: string;
  export default svg;
}
