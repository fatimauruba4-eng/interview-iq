
import Hero from "@/components/landing/hero";
import Navbar from "@/components/landing/navbar";
import { Montserrat, Manrope, Archivo_Black } from "next/font/google";
import Link from "next/link";

const archivo_black = Archivo_Black({
  subsets: ["latin"],
  weight: ["400"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
});

const manrope = Manrope({
  subsets: ["latin"],
});

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />

      <Hero />

      <main className="bg-white">
        <section className="px-5 pt-4 sm:px-7 sm:pt-5 md:px-10 md:pt-5">
          <div className="max-w-xl -translate-y-4">
            <h1
              className={`${archivo_black.className} text-3xl leading-[1.05] sm:text-4xl md:text-[40px]`}
            >
              Ace Your Next Interview
            </h1>

            <p
              className={`${montserrat.className} mt-3 text-lg leading-tight text-gray-600 sm:text-xl md:text-[22px]`}
            >
              Practice with AI and
              <br />
              prepare for your dream job.
            </p>
          </div>
        </section>

        <section className="px-5 py-6 sm:px-7 sm:py-7 md:px-10 md:py-7">
          <div className="ml-auto max-w-xl -translate-y-4 text-right">
            <p
              className={`${montserrat.className} ml-auto max-w-md text-lg leading-tight sm:text-xl md:text-[22px]`}
            >
              Build confidence through realistic
              <br />
              AI-powered interview practice.
            </p>

            <p
              className={`${manrope.className} ml-auto mt-2 max-w-md text-sm leading-relaxed text-gray-500 sm:text-base`}
            >
              Practice questions, improve your answers,
              and get instant feedback to become
              interview-ready.
            </p>

            <Link href="/sign-up">
              <button
                type="button"
                className={`${montserrat.className} mt-4 rounded-md border-2 border-black bg-white px-5 py-2 text-sm text-black transition-colors duration-200 hover:bg-black hover:text-white sm:text-base`}
              >
                Get Started
              </button>
            </Link>
          </div>
        </section>

        <section className="w-full overflow-hidden rounded-t-3xl">
          <div className="h-[380px] w-full overflow-hidden sm:h-[420px] md:h-[440px] lg:h-[460px]">
            <img
              src="/interview.jpg"
              alt="A professional preparing for an interview"
              className="block h-full w-full object-cover object-[center_38%]"
            />
          </div>
        </section>
      </main>
    </div>
  );
}

