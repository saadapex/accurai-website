const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, LevelFormat, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, Header, Footer, ExternalHyperlink, TableOfContents, PageBreak
} = require('docx');

const NAVY = "073B4C", TEAL = "0B6E69", GREEN = "2A9D8F", ORANGE = "F97316";
const RED = "C0392B", AMBER = "B8860B", GREYTXT = "5A6A72", LINE = "CCCCCC";

const FULL = 9360;
const sevColor = s => ({Critical: RED, High: RED, Medium: AMBER, Low: TEAL, Good: GREEN}[s] || NAVY);

function h1(t){ return new Paragraph({ heading: HeadingLevel.HEADING_1, children:[new TextRun(t)] }); }
function h2(t){ return new Paragraph({ heading: HeadingLevel.HEADING_2, children:[new TextRun(t)] }); }
function p(runs, opts={}){ return new Paragraph({ spacing:{after:120}, children: Array.isArray(runs)?runs:[new TextRun(runs)], ...opts }); }
function bullet(text, level=0){ return new Paragraph({ numbering:{reference:"bullets", level}, spacing:{after:60}, children: Array.isArray(text)?text:[new TextRun(text)] }); }
function num(text){ return new Paragraph({ numbering:{reference:"nums", level:0}, spacing:{after:80}, children: Array.isArray(text)?text:[new TextRun(text)] }); }
function bold(t){ return new TextRun({text:t, bold:true}); }
function run(t){ return new TextRun(t); }

const border = { style: BorderStyle.SINGLE, size: 1, color: LINE };
const borders = { top:border, bottom:border, left:border, right:border };
function cell(children, width, fill){
  return new TableCell({
    borders, width:{size:width, type:WidthType.DXA},
    shading: fill ? {fill, type:ShadingType.CLEAR} : undefined,
    margins:{top:80,bottom:80,left:120,right:120},
    children: Array.isArray(children)?children:[new Paragraph({children:[new TextRun(children)]})]
  });
}
function headerRow(labels, widths){
  return new TableRow({ tableHeader:true, children: labels.map((l,i)=>
    new TableCell({ borders, width:{size:widths[i],type:WidthType.DXA}, shading:{fill:NAVY,type:ShadingType.CLEAR},
      margins:{top:80,bottom:80,left:120,right:120},
      children:[new Paragraph({children:[new TextRun({text:l,bold:true,color:"FFFFFF"})]})] })) });
}
function sevPara(s){ return new Paragraph({children:[new TextRun({text:s, bold:true, color:sevColor(s)})]}); }

function findingsTable(rows){
  const w = [1900, 1300, 6160];
  return new Table({
    width:{size:FULL,type:WidthType.DXA}, columnWidths:w,
    rows:[ headerRow(["Area","Severity","Finding"], w),
      ...rows.map(r=> new TableRow({children:[
        cell([new Paragraph({children:[new TextRun({text:r[0],bold:true})]})], w[0]),
        cell([sevPara(r[1])], w[1]),
        cell([new Paragraph({children:[new TextRun(r[2])]})], w[2]),
      ]}))
    ]
  });
}

const today = "June 15, 2026";

function BODY(){
  const c = [];

  c.push(new Paragraph({ spacing:{before:1200, after:0}, children:[new TextRun({text:"Accurai", size:64, bold:true, color:NAVY})]}));
  c.push(new Paragraph({ spacing:{after:40}, children:[new TextRun({text:"Website Audit — Full Review", size:36, bold:true, color:TEAL})]}));
  c.push(new Paragraph({ spacing:{after:300}, children:[new TextRun({text:"SEO · AI Discoverability · Visual / UX · Conversion · Authority & Authenticity · Accuracy", size:22, color:GREYTXT})]}));
  c.push(p([bold("Site audited: "), run("https://accurai.ca")]));
  c.push(p([bold("Date: "), run(today)]));
  c.push(p([bold("Prepared for: "), run("Saad Usmani")]));
  c.push(p([bold("Method: "), run("Live-site fetch of the homepage, robots.txt, llms.txt and sitemap, plus static analysis of the deployed source (src/index.html) and the prerendered output across all 23 routes.")]));
  c.push(new Paragraph({ spacing:{before:200}, border:{bottom:{style:BorderStyle.SINGLE,size:6,color:TEAL,space:6}}, children:[new TextRun("")]}));
  c.push(new Paragraph({ spacing:{before:240, after:80}, children:[new TextRun({text:"Overall verdict", bold:true, size:24, color:NAVY})]}));
  c.push(p("The site is well-built, honest, and unusually strong on the fundamentals that most small-business sites get wrong — clean per-page URLs, complete structured data, an llms.txt, and an AI-crawler-friendly robots.txt. It is genuinely close to launch-ready. Three issues, however, are doing real damage right now and should be fixed before any promotion: the contact forms do not work, the domain canonical setup contradicts itself, and the headline numbers render as “0” and “$0” to anything that doesn’t run JavaScript (including AI crawlers). None require a rebuild — all are small, contained fixes."));
  c.push(new Paragraph({children:[new PageBreak()]}));

  c.push(h1("Contents"));
  c.push(new TableOfContents("Contents", { hyperlink:true, headingStyleRange:"1-2" }));
  c.push(new Paragraph({children:[new PageBreak()]}));

  c.push(h1("Scorecard at a glance"));
  c.push(p("Scores are directional, reflecting how the site performs today against best practice for a small-business service site that wants to be found by both search engines and AI answer engines."));
  {
    const w=[2600, 1500, 5260];
    const rows = [
      ["SEO","B — Good","Excellent technical foundation; held back by a canonical/redirect conflict and “0” values in static HTML."],
      ["AI discoverability","B+ — Strong","Among the best-prepared small sites; only the stale llms.txt links and the “$0” rendering hold it back."],
      ["Visual / UX","A- — Strong","Clean, on-brand, responsive. Recent contrast and layout fixes landed. Needs a live device pass to confirm."],
      ["Conversion","C — Needs work","Strong CTAs and lead magnets, but the forms do not submit — the primary conversion path is broken."],
      ["Authority & authenticity","B — Good","Honest and credible for a pre-launch brand; light on third-party proof (expected at this stage)."],
      ["Accuracy & correctness","C+ — Mixed","Contact details and pricing are consistent, but the “$0” rendering and broken forms are correctness defects."],
    ];
    c.push(new Table({ width:{size:FULL,type:WidthType.DXA}, columnWidths:w,
      rows:[ headerRow(["Dimension","Grade","Summary"], w),
        ...rows.map(r=> new TableRow({children:[
          cell([new Paragraph({children:[new TextRun({text:r[0],bold:true})]})], w[0]),
          cell([new Paragraph({children:[new TextRun({text:r[1],bold:true,color:NAVY})]})], w[1]),
          cell(r[2], w[2]),
        ]}))
      ]}));
  }

  c.push(h1("Top priorities (fix before promoting the site)"));
  c.push(p([bold("1. Wire up the contact forms. "), run("Both forms (Book an Audit, and the Sample Report request) still post to the Formspree placeholder "), new TextRun({text:"YOUR_FORM_ID",font:"Courier New"}), run(". On the live site a submission fails and the visitor sees the error message. Every “Book an Audit” / “Request My Audit” button leads here, so the primary conversion path is currently dead. Now that email is being set up, create the Formspree form pointing at hello@accurai.ca and swap the ID.")]));
  c.push(p([bold("2. Resolve the www / non-www conflict. "), run("Every canonical tag, the sitemap, the robots.txt sitemap line and the Open Graph URLs all point to the apex "), new TextRun({text:"accurai.ca",font:"Courier New"}), run(", but the live site 308-redirects the apex to "), new TextRun({text:"www.accurai.ca",font:"Courier New"}), run(". So the canonical URL itself redirects elsewhere — a contradiction that splits ranking signals and confuses crawlers. Fix by making the apex the primary domain in Vercel (redirect www → apex) so the live URL matches the canonicals.")]));
  c.push(p([bold("3. Bake the real numbers into the static page. "), run("The animated count-up figures — the accuracy gauge, the “100” questions stat and the “$299” founding-audit price — start at zero and only count up via JavaScript. The prerendered HTML therefore captures them at zero, so a crawler or AI engine reading the page sees “$0 Founding-client audit” and “0 customer-style questions.” Render the final values server-side (and animate from there) so the static page is factually correct.")]));
  c.push(new Paragraph({children:[new PageBreak()]}));

  // SEO
  c.push(h1("1. SEO"));
  c.push(h2("What’s working well"));
  c.push(bullet("Clean, unique per-page URLs (/services, /pricing, /blog/<slug>, etc.) — all 23 routes are prerendered to real, indexable static HTML rather than a single SPA shell. This is the single biggest SEO win and it is done right."));
  c.push(bullet("Every page has its own title, meta description, and canonical tag; Open Graph and Twitter Card tags are present and synced per route."));
  c.push(bullet("A valid sitemap.xml (23 URLs) is published and referenced from robots.txt."));
  c.push(bullet("All images carry descriptive alt text and use lazy loading; viewport meta and responsive breakpoints are in place."));
  c.push(bullet("Rich structured data (see the AI section) also benefits classic search — the FAQ schema is eligible for rich results."));
  c.push(h2("Issues found"));
  c.push(findingsTable([
    ["Canonical / redirect","High","All canonicals, the sitemap, the robots sitemap line and og:url use the apex (accurai.ca), but the apex 308-redirects to www. The canonical points to a URL that redirects — fix the primary-domain direction in Vercel so the served URL and the canonical agree."],
    ["Static numbers","Medium","Count-up stats render as 0 in the no-JS / prerendered HTML: the score gauge shows 0, “100 questions” shows 0, and the “$299” audit price shows $0. Search engines may index these zero values. Bake the final numbers into the prerender."],
    ["Duplicate H1","Low–Med","Each page’s <noscript> block contains a generic H1 (“Accurai — AI accuracy you can trust”) in addition to the page’s real H1, so the raw HTML has two H1s per page for non-JS crawlers. Demote the noscript heading to an H2 or paragraph."],
    ["Title length","Low","A few titles exceed ~60 characters and will truncate in search results: the Agentic AI Safety page (79), the “spot wrong AI answers” blog post (70), and the Industries index (68). Tighten these."],
    ["Meta description","Low","The Agentic AI Safety page description is 177 characters and will be cut off (~155 is the safe limit). One or two others are close. Trim to a single clear sentence."],
    ["Soft 404 risk","Low","vercel.json rewrites every unmatched path to index.html, so an unknown URL can return a 200 SPA shell rather than a true 404. Confirm unknown paths serve the 404 route with a proper status."],
  ]));

  // AI
  c.push(h1("2. AI discoverability"));
  c.push(p("This is where the site is most differentiated. For a brand whose whole proposition is AI quality, being well-represented to AI answer engines matters as much as classic SEO — and the groundwork here is excellent."));
  c.push(h2("What’s working well"));
  c.push(bullet("Comprehensive JSON-LD: ProfessionalService, WebSite, Organization, Person (founder), PostalAddress, and a full FAQPage with 14 question/answer pairs — highly machine-readable."));
  c.push(bullet("robots.txt explicitly welcomes the major AI crawlers by name (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, anthropic-ai, PerplexityBot, Google-Extended, Applebot-Extended, CCBot). This is a deliberate, correct choice for a brand that wants to be cited."));
  c.push(bullet("A detailed llms.txt summary exists — most sites have none. It cleanly states the offering, services, pricing, scoring method, industries, and contact details."));
  c.push(bullet("A no-JS <noscript> content fallback describes the business in plain text, so non-rendering crawlers still get real content."));
  c.push(h2("Issues found"));
  c.push(findingsTable([
    ["llms.txt links","Medium","The Key Pages and Resources links in llms.txt still use the old hash-route format (e.g. accurai.ca/#/services, /#/resources). The site moved to clean URLs, so these no longer match. An AI following them lands on the SPA shell, not the canonical page. Update every link to the clean path (/services, /resources, …)."],
    ["“$0” to AI readers","Medium","Because the price counts up via JS, an AI crawler reading the homepage HTML sees “$0 Founding-client audit” and “0 customer-style questions,” which contradicts the correct $299 / 75–100 stated in llms.txt. The same fix as SEO #2 resolves this — important because an AI could quote the wrong price."],
    ["Sitemap host","Low","llms.txt and the canonicals should agree on the host once the www/apex decision is made, so AI engines consistently learn one canonical domain."],
  ]));

  // VISUAL
  c.push(h1("3. Visual / UX"));
  c.push(h2("What’s working well"));
  c.push(bullet("Clean, calm, on-brand design — consistent use of the navy / teal / green palette, Plus Jakarta Sans display type, and the checkmark/gauge visual language rather than generic “robot” AI clichés."));
  c.push(bullet("Strong interactive proof elements: the live AI-test demo, animated score gauge, before/after drag slider, and the process walkthrough all reinforce the value proposition concretely."));
  c.push(bullet("Recent fixes already landed: the ghost-button contrast issue on white cards and the stretched “bento” grid whitespace were both corrected and deployed."));
  c.push(bullet("Mobile navigation and responsive breakpoints are implemented; images lazy-load."));
  c.push(h2("Issues found"));
  c.push(findingsTable([
    ["Live device pass","Medium","Static analysis can confirm structure but not pixels. Before promoting, do a real pass on an actual phone and on Safari/Chrome — specifically the live demo, the drag slider, the pricing toggle, and the mobile nav — and confirm the count-up numbers animate rather than sitting at 0."],
    ["Zero-state flash","Low","Until the static-number fix lands, first paint shows 0 / $0 for a moment before the animation runs (and permanently if JS is slow or blocked). Baking the final values removes this."],
    ["Accessibility","Low","Worth a quick check: colour-contrast on muted grey body text over white, visible keyboard focus states, and that interactive demo controls are reachable by keyboard. Nothing flagged structurally, but verify."],
  ]));

  // CONVERSION
  c.push(h1("4. Conversion"));
  c.push(h2("What’s working well"));
  c.push(bullet("Clear, repeated primary CTA (“Book an Audit”) with a low-friction promise: “founding audits from $299 · results in 3–7 business days · no chatbot required.”"));
  c.push(bullet("Genuine lead magnets — three branded PDF checklists offered as instant, no-signup downloads, plus a “Start free” band for visitors not ready to buy."));
  c.push(bullet("Effective risk-reducers: founding-client pricing with scarcity, a sample scored report, and the before/after demo that shows the value before asking for anything."));
  c.push(bullet("Logical service ladder — start with a cheap audit, add cleanup/QA/monitoring only if needed — lowers the commitment barrier."));
  c.push(h2("Issues found"));
  c.push(findingsTable([
    ["Forms broken","Critical","Both the audit-request and sample-report forms still post to the Formspree placeholder, so live submissions fail and show an error. Every primary CTA funnels here, so the main conversion path converts nobody. This is the #1 fix."],
    ["No fallback capture","Medium","Because the form is the only conversion mechanism, a failed submit loses the lead entirely. The inline error does surface the email address as a fallback — good — but the form must work. Consider also making the phone/email more prominent near the form."],
    ["No analytics","Low","There’s no analytics (e.g. Plausible or GA), so you can’t yet see traffic, drop-off, or which CTA converts. Add lightweight analytics so post-launch decisions are data-driven."],
  ]));

  // AUTHORITY
  c.push(h1("5. Authority & authenticity"));
  c.push(h2("What’s working well"));
  c.push(bullet("Scrupulously honest for a pre-launch brand: no fabricated testimonials, no fake client logos, no invented statistics. The “what an audit surfaces” cards are explicitly labelled “illustrative,” and the before/after demo is labelled “Sample.” This integrity is itself a trust signal and entirely on-brand for an accuracy company."));
  c.push(bullet("Real, verifiable identity: named founder (Zuhair Usmani), a real Oakville address, a consistent phone number, and a LinkedIn link. ProfessionalService + Person schema reinforce this to search and AI."));
  c.push(bullet("Plain-English, specific positioning (“practical AI quality control, not vague AI consulting”) reads as credible and expert rather than hypey."));
  c.push(h2("Opportunities (not defects)"));
  c.push(findingsTable([
    ["Third-party proof","Medium","The site has no real testimonials, case studies, or results yet — appropriate today, but this is the main lever for authority. Capture a quantified result or short quote from the first founding clients and add a case study; that will lift both conversion and credibility more than anything else."],
    ["E-E-A-T on blog","Low","Confirm blog posts show an author byline and date. Attributing posts to the named founder strengthens experience/expertise signals for both Google and AI engines."],
    ["Credentials","Low","If applicable, a brief line on the founder’s relevant background (the telecom/systems-engineering depth) would reinforce expertise without overclaiming."],
  ]));

  // ACCURACY
  c.push(h1("6. Accuracy & correctness"));
  c.push(h2("What’s working well"));
  c.push(bullet("Contact details are consistent everywhere: the phone number, hello@accurai.ca, and the Oakville address match across the page body, footer, and structured data."));
  c.push(bullet("Pricing is consistent between the pricing section and llms.txt ($299 founding audit, $499 agentic, $300/mo monitoring, etc.)."));
  c.push(bullet("No unrendered template placeholders leak into the visible content — the prerender output is clean on that front across all routes checked."));
  c.push(h2("Issues found"));
  c.push(findingsTable([
    ["Wrong numbers in HTML","High","The static page literally reads “$0 Founding-client audit” and “0 customer-style questions” because of the count-up behaviour. That is a factual error in the served HTML for any non-JS reader. Same fix as the SEO/AI items."],
    ["Broken functionality","High","The contact forms don’t submit (placeholder endpoint) — a correctness defect as well as a conversion one."],
    ["Security headers","Low","vercel.json sets no security headers. Adding Strict-Transport-Security, X-Content-Type-Options: nosniff, Referrer-Policy and a basic Permissions-Policy is a quick hardening win and a minor trust/SEO positive."],
    ["DMARC / email auth","Low","The domain’s default DMARC TXT still points at GoDaddy’s mail infrastructure. When Google Workspace email goes live, update DMARC/SPF/DKIM so hello@accurai.ca authenticates correctly and replies don’t land in spam."],
  ]));
  c.push(new Paragraph({children:[new PageBreak()]}));

  // ACTION PLAN
  c.push(h1("Prioritised action plan"));
  c.push(h2("Do before promoting the site"));
  c.push(num([bold("Wire the forms to Formspree "), run("pointing at hello@accurai.ca, then swap the placeholder ID in src/index.html and push. Test a real submission end-to-end.")]));
  c.push(num([bold("Set the apex as the primary domain in Vercel "), run("(redirect www → accurai.ca) so the live URL matches every canonical, the sitemap, and og:url.")]));
  c.push(num([bold("Bake the count-up numbers into the prerender "), run("so the gauge, “100,” and “$299” appear as their real values in static HTML; animate from the final value, not from 0.")]));
  c.push(h2("Do soon after launch"));
  c.push(num([bold("Update llms.txt links "), run("to the clean URL format (remove the /#/ hash paths).")]));
  c.push(num([bold("Demote the duplicate noscript H1 "), run("to an H2/paragraph; tighten the handful of over-length titles and the 177-character meta description.")]));
  c.push(num([bold("Add lightweight analytics "), run("(Plausible or GA) and submit the sitemap to Google Search Console and Bing Webmaster Tools.")]));
  c.push(num([bold("Run a live device/browser QA pass "), run("on the interactive elements and confirm accessibility basics (contrast, focus states, keyboard reach).")]));
  c.push(num([bold("Add security headers "), run("in vercel.json and finalise email authentication (SPF/DKIM/DMARC) once Workspace is live.")]));
  c.push(h2("Ongoing — build authority"));
  c.push(num([bold("Capture a real result from the first founding clients "), run("and publish a short, quantified case study. This is the highest-leverage move for both conversion and authority once the basics above are fixed.")]));
  c.push(new Paragraph({ spacing:{before:240}, children:[new TextRun({text:"Bottom line: the foundation is strong and the brand is honest. Fix the three top-priority items — forms, canonical direction, and the “$0” rendering — and the site moves from “close” to genuinely launch-ready.", italics:true, color:NAVY})]}));

  return c;
}

const doc = new Document({
  creator: "Accurai", title: "Accurai Website Audit",
  styles: {
    default: { document: { run: { font: "Arial", size: 21, color: "1F2937" } } },
    paragraphStyles: [
      { id:"Heading1", name:"Heading 1", basedOn:"Normal", next:"Normal", quickFormat:true,
        run:{size:32, bold:true, font:"Arial", color:NAVY},
        paragraph:{spacing:{before:300, after:160}, outlineLevel:0,
          border:{bottom:{style:BorderStyle.SINGLE, size:6, color:TEAL, space:4}}} },
      { id:"Heading2", name:"Heading 2", basedOn:"Normal", next:"Normal", quickFormat:true,
        run:{size:26, bold:true, font:"Arial", color:TEAL},
        paragraph:{spacing:{before:220, after:120}, outlineLevel:1} },
      { id:"Heading3", name:"Heading 3", basedOn:"Normal", next:"Normal", quickFormat:true,
        run:{size:22, bold:true, font:"Arial", color:NAVY},
        paragraph:{spacing:{before:140, after:80}, outlineLevel:2} },
    ]
  },
  numbering: { config: [
    { reference:"bullets", levels:[
      {level:0, format:LevelFormat.BULLET, text:"•", alignment:AlignmentType.LEFT, style:{paragraph:{indent:{left:600,hanging:300}}}},
      {level:1, format:LevelFormat.BULLET, text:"–", alignment:AlignmentType.LEFT, style:{paragraph:{indent:{left:1140,hanging:300}}}},
    ]},
    { reference:"nums", levels:[
      {level:0, format:LevelFormat.DECIMAL, text:"%1.", alignment:AlignmentType.LEFT, style:{paragraph:{indent:{left:600,hanging:300}}}},
    ]},
  ]},
  sections: [{
    properties: { page: { size:{width:12240,height:15840}, margin:{top:1440,right:1440,bottom:1440,left:1440} } },
    footers: { default: new Footer({ children:[ new Paragraph({
      alignment:AlignmentType.CENTER,
      border:{top:{style:BorderStyle.SINGLE,size:4,color:LINE,space:6}},
      children:[ new TextRun({text:"Accurai Website Audit  ·  Confidential  ·  Page ", size:16, color:GREYTXT}),
                 new TextRun({children:[PageNumber.CURRENT], size:16, color:GREYTXT}) ] }) ] }) },
    children: BODY()
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(process.argv[2] || "Accurai_Website_Audit.docx", buf);
  console.log("WROTE", buf.length, "bytes");
});
