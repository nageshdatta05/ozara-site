import { homeSections } from "@/config/sections";

export default function Home() {
  return (
    <>
      {homeSections
        .filter((s) => s.enabled)
        .map(({ id, component: Section }) => (
          <Section key={id} />
        ))}
    </>
  );
}
