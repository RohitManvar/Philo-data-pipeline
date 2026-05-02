import Head from "next/head";
import Navbar from "../components/Navbar";

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>About &mdash; Enlyghten</title>
        <meta name="description" content="About Enlyghten — a newspaper-style encyclopedia of philosophy." />
      </Head>

      <div className="np-shell">
        <Navbar />

        <div className="np-headline-block" style={{ marginTop: 24 }}>
          <div className="kicker">The Editorial</div>
          <h1>About</h1>
          <div className="deck">A daily broadsheet for the life of the mind.</div>
        </div>

        <div className="about-body">
          <div className="about-col">
            <h2 className="np-section-h">The Mission</h2>
            <p>
              Enlyghten began as a simple question: what if philosophy were as accessible as a morning
              newspaper? Not watered down — stripped of jargon, yes, but not stripped of weight.
              The ideas here are the same ones that kept Socrates up at night and sent Nietzsche
              to his typewriter at dawn. We&rsquo;ve simply laid them flat on the page, in ink,
              as a broadsheet.
            </p>
            <p>
              Every thinker in this archive shaped the way human beings understand themselves and
              their world. Whether you arrive here chasing a name from a lecture or a rabbit hole
              opened by an idle afternoon, you leave knowing something true.
            </p>

            <h2 className="np-section-h">The Design</h2>
            <p>
              The newspaper format is deliberate. Philosophy is not a museum exhibit — it is
              living argument, still in progress. The broadsheet layout, the column rules, the
              drop-caps: these are the visual language of ideas in circulation, ideas that expect
              a reader rather than a viewer.
            </p>
            <p>
              The typeface is Old Standard TT for display, Source Serif 4 for body — both chosen
              for their long association with scholarly printing. The paper grain in the background
              is a reminder that the medium has always mattered.
            </p>

            <h2 className="np-section-h">The Data</h2>
            <p>
              Philosopher profiles are drawn from Wikipedia via a custom ETL pipeline that scrapes,
              cleans, and stores structured data into PostgreSQL. The pipeline runs automatically
              every two days, keeping the archive current. All source data is open and attributed.
            </p>

            <blockquote className="np-pull">
              &ldquo;I&rsquo;m exerting myself to escape the same mind that traps me.&rdquo;
              <span style={{ display: "block", marginTop: 12, fontSize: 13, fontStyle: "normal", fontFamily: "var(--sans)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-soft)" }}>— rohyt</span>
            </blockquote>
          </div>

          <aside className="about-aside">
            <div className="np-sidecard">
              <div className="h">By the Numbers</div>
              <dl>
                <dt>Philosophers</dt>
                <dd>288+</dd>
                <dt>Eras covered</dt>
                <dd>Ancient → Contemporary</dd>
                <dt>Traditions</dt>
                <dd>Western · Eastern · Islamic</dd>
                <dt>Updated</dt>
                <dd>Every 2 days</dd>
              </dl>
            </div>

            <div className="np-sidecard">
              <div className="h">The Masthead</div>
              <dl>
                <dt>Editor & Developer</dt>
                <dd>Rohit Manvar</dd>
                <dt>Data Pipeline</dt>
                <dd>Rohit Manvar</dd>
                <dt>Design</dt>
                <dd>Newspaper broadsheet, 2024</dd>
              </dl>
            </div>
          </aside>
        </div>

        <footer className="footer">
          <div className="mark">Enl<span className="y">y</span>ghten<span className="accent">.</span></div>
          <div>All the philosophy that&rsquo;s fit to read</div>
        </footer>
      </div>
    </>
  );
}
