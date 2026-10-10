/* ==========================================================================
   COPY — every word on the site, in one place.
   Lines from the OZARA design boards are used as written ("Three expressions.
   One identity.", "Your world, verified.", the three-word expressions).
   Wrap a word in *asterisks* to set it in italic.
   Nothing here states a metal, a size, a price or a date — those are not
   confirmed yet.
   ========================================================================== */

export const copy = {
  opening: {
    label: "The collection",
    eyebrow: "The luxury NFC bracelet",
    headline: ["Three expressions.", "One identity."],
    sub: "Tap it to a phone and your personal page opens, with the details, links and photo you choose to share.",
    how: "See how it works",
    choose: "Choose a piece",
    explore: "Explore",
    scroll: "Scroll",
  },

  /* DISCOVER — the house, in one sentence */
  statement: {
    eyebrow: "What is OZARA",
    text: "A luxury bracelet with your own personal page inside it. Tap it to a phone, and what you've chosen to share opens at once.",
    /** Make it yours → Tap to connect → Share your world. */
    steps: [
      { title: "Make it yours", body: "Add your name, photo and links. Show only what you choose." },
      { title: "Tap to connect", body: "Hold the Eye to a phone. No app needed." },
      { title: "Share your world", body: "Your page opens, showing just what you chose." },
    ],
  },

  /* The three ideas behind the house */
  signature: {
    eyebrow: "Why OZARA",
    headline: "Made to be worn. Made to be shared.",
    ideas: [
      {
        kicker: "Recognised",
        title: "Known at a glance.",
        body: "The Eye marks every OZARA bracelet.",
      },
      {
        kicker: "Yours to keep",
        title: "Not a wristband.",
        body: "Jewellery you keep. Change your page whenever you like.",
      },
      {
        kicker: "The few",
        title: "Made in a first run.",
        body: "Each one registered to its owner.",
      },
    ],
    link: "The story of the house",
  },

  /* EXPLORE — each piece, composed differently */
  expressions: {
    eyebrow: "The collection",
    discover: "Discover",
  },

  /* FOCUS — the emblem becomes the eye, the eye becomes the tap */
  eye: {
    eyebrow: "The OZARA eye",
    stages: [
      { kicker: "The emblem", title: "A ring and a four-pointed star.", body: "The mark of the house — set at the heart of every bracelet." },
      { kicker: "The Eye", title: "More than a signature.", body: "The OZARA Eye is where you tap. Your personal page opens from here." },
      { kicker: "The tap", title: "Hold it to a phone.", body: "Your page opens in their browser. No app, no battery, nothing to charge." },
    ],
  },

  /* UNDERSTAND → IDENTIFY → CONNECT */
  identity: {
    eyebrow: "Your OZARA ID",
    headline: ["Your identity,", "*in one tap.*"],
    body: "Your OZARA ID is your personal page, opened by a tap. You choose what it shows.",
    journey: ["Your bracelet", "You choose", "They tap", "Your page", "Genuine"],
    disclaimer: "",
    /* The card's faces. "__featured__" is replaced with a piece name. */
    faces: [
      {
        key: "choose",
        tab: "You choose",
        stop: 1,
        line: "Add your name, photo, links and contact details. Hide any of them, any time.",
        kicker: "Your OZARA ID",
        title: { label: "Page of", value: "Your name" },
        code: "YOU DECIDE",
        mark: "tap",
        fields: [
          { label: "Photo", value: "Show or hide" },
          { label: "Links", value: "Show or hide" },
          { label: "Contact", value: "Show or hide" },
        ],
      },
      {
        key: "page",
        tab: "Your page",
        stop: 3,
        line: "Someone taps. Your page opens in their browser, with only what you chose.",
        kicker: "Opens on tap",
        title: { label: "Opens", value: "Your page" },
        code: "TAP TO OPEN",
        mark: "pass",
        fields: [
          { label: "Shows", value: "What you chose" },
          { label: "Saves", value: "To their contacts" },
          { label: "Needs", value: "No app" },
        ],
      },
      {
        key: "piece",
        tab: "Genuine",
        stop: 4,
        line: "Proof it's a real OZARA, on every tap.",
        kicker: "OZARA ID",
        title: { label: "Piece", value: "__featured__" },
        code: "BR — ●●● ●●●",
        mark: "hallmark",
        fields: [
          { label: "Status", value: "Authentic" },
          { label: "Issued by", value: "OZARA" },
          { label: "Checked", value: "On every tap" },
        ],
      },
    ],
    link: "How it works",
  },

  /* VALUE — what owning one actually gets you */
  access: {
    eyebrow: "Your access",
    headline: ["Your bracelet.", "*Your access.*"],
    flow: [
      { title: "Wear it", body: "Your bracelet, registered to your OZARA ID." },
      { title: "Arrive", body: "At an OZARA Exclusive or OZARA Approved event." },
      { title: "Tap", body: "The Eye is checked at the door, in a second." },
      { title: "Unlock", body: "Your entry — and what the evening holds for holders." },
    ],
    tiers: [
      { name: "OZARA Exclusive", body: "Evenings made only for OZARA holders. Your bracelet is the invitation." },
      { name: "OZARA Approved", body: "Selected events beyond our own, where holders are recognised — and receive more." },
    ],
  },

  worn: {
    eyebrow: "Set with stones",
    headline: ["Three designs.", "*One vision.*"],
  },

  closing: {
    eyebrow: "Collection 01 · Pre-Order",
    headline: ["Your identity.", "*One tap away.*"],
    body: "The first run is being prepared.",
    waitlist: "Or join the list.",
  },

  /* Shared copy for every product page (/shop/[slug]). */
  productPage: {
    scroll: "Scroll to explore",
    customise: {
      eyebrow: "Customise with gemstones",
      title: "Add a touch of you.",
      body: "Stones along the band and at the heart of the star — as many as you like.",
      none: "Base Model",
      note: "Priced by the number of stones — agreed with you before you pay.",
    },
    eye: {
      eyebrow: "The eye",
      headline: ["Hold the eye", "*to a phone.*"],
      steps: [
        { title: "Hold", body: "No app needed." },
        { title: "Opens", body: "Your personal page, as you set it." },
        { title: "Genuine", body: "Checked against our register." },
      ],
      image: "",
    },
    craft: {
      eyebrow: "Details",
      lines: ["The eye, brushed flat.", "The hinge.", "The line of the form."],
    },
    /* Product essentials — shown on every piece's page. Keep them true. */
    essentials: {
      materials: (finish: string) => `${finish} finish. The metal and plating for each finish are confirmed with you in writing before your piece is made.`,
      sizing: "Choose S, M or L. We confirm the fit with you before your piece is made.",
      shipping: "Made in the first run and delivered once finished. Delivery is shown at checkout.",
      care: "Store in its pouch. Wipe with a soft, dry cloth. Avoid perfume, chemicals and water. The tag needs no charging.",
      technology: "An NFC tag within. Hold the eye to a phone and your personal page opens on our website, showing only what you chose. No battery, no GPS, no tracking.",
      returns: "Made to order. Terms are confirmed in writing before you pay — see our Terms.",
    },
    detailsEyebrow: "The piece",
    faqEyebrow: "Questions",
    faq: [
      { title: "When will the pieces be available?", body: "Launch timing will be shared with the waiting list first. Join it from this page to be notified." },
      { title: "What does the NFC do?", body: "A tap opens your personal page on our website, with the details you chose to share. It also confirms the bracelet is genuine." },
      { title: "Does a tap share everything on my phone?", body: "No. It opens a web page. You decide what is on it, and nothing from your phone is sent." },
      { title: "Do I need an app?", body: "No. The tap opens a web page on most modern phones." },
      { title: "Is the technology visible?", body: "No. The tag sits within the bracelet; what you see is the jewellery and the eye." },
      { title: "Which sizes are offered?", body: "S, M and L. Base Models are ₹15,000; pieces with stones are priced by the number of stones." },
    ],
    relatedEyebrow: "The other expressions",
  },

  shop: {
    eyebrow: "Collection 01",
    headline: ["Three expressions.", "*One identity.*"],
    body: "Three bracelets. One eye.",
  },

  technology: {
    eyebrow: "Technology",
    headline: ["Jewellery first.", "*Technology within.*"],
    body: "It wears like jewellery. Inside, an NFC tag opens your personal page when a phone is held to it.",
    chain: [
      { title: "The bracelet", body: "Jewellery, with the eye at its centre." },
      { title: "A unique identity", body: "Its own ID, registered before it leaves us." },
      { title: "Authentication", body: "A tap confirms it is ours, and active." },
      { title: "Your page", body: "Registered to you. Your name, photo and links appear only if you choose." },
      { title: "Yours to keep", body: "One bracelet. Update your page whenever you like." },
    ],
    honesty: {
      title: "What it does today — plainly.",
      body: "Today's tag carries a link with the bracelet's ID, checked against our register. It is not yet cryptographic, so unusual activity is reviewed. Tags that sign every tap are planned.",
    },
  },

  about: {
    eyebrow: "About",
    headline: ["Jewellery meets", "*technology.*"],
    intro: "A luxury bracelet that opens your personal page with a tap, Three designs, one sign: the Eye.",
    sections: [
      { title: "The eye", body: "A ring and a four-pointed star. Set into the metal, it becomes an eye — and where the piece meets your phone." },
      { title: "The wave", body: "The Wave rises and falls, the Flow turns, the Line holds one curve. Jewellery that follows the wrist." },
      { title: "The few", body: "Fewer pieces, each one known. Made in a first run and tied to its owner." },
      { title: "Jewellery first", body: "You should see a bracelet, not a device." },
    ],
  },

  contact: {
    eyebrow: "Contact",
    headline: ["Write to", "*the house.*"],
    body: "The collection, bracelets for your club or organisation, or press.",
    organisers: "Run a club or membership? Write to us about bracelets for your members.",
  },
};
