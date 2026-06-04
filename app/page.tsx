import { getProfile } from "@/lib/profile";
import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { About } from "@/components/landing/About";
import { Cases } from "@/components/landing/Cases";
import { Projects } from "@/components/landing/Projects";
import { Skills } from "@/components/landing/Skills";
import { Education } from "@/components/landing/Education";
import { Activities } from "@/components/landing/Activities";
import { Contact } from "@/components/landing/Contact";

export const revalidate = 60; // ISR: обновлять данные раз в минуту

export default async function Home() {
  const profile = await getProfile();

  return (
    <main className="min-h-screen">
      <Nav name={profile.personal.shortName} />
      <Hero profile={profile} />
      <About profile={profile} />
      <Cases profile={profile} />
      <Projects projects={profile.projects} />
      <Skills skills={profile.skills} />
      <Education profile={profile} />
      <Activities activities={profile.activities} />
      <Contact personal={profile.personal} />
    </main>
  );
}
