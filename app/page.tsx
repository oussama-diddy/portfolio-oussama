import Portfolio from "./components/portfolio";

export default function Home() {
  return <Portfolio year={new Date().getUTCFullYear()} />;
}
