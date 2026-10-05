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
    eyebrow: "Collection 01 · Pre-Order open",
    headline: ["Three expressions.", "One identity."],
    choose: "Choose a piece",
    explore: "Explore",
    scroll: "Scroll",
  },

  /* DISCOVER — the house, in one sentence */
  statement: {
    eyebrow: "What is OZARA",
    text: "A luxury bracelet that marks you as one of OZARA — and opens experiences most people never see.",
    /** Wear → Tap → Unlock: the whole idea in three words. */
    steps: [
      { title: "Wear", body: "Jewellery first. The Eye at its heart." },
      { title: "Tap", body: "Hold the Eye to a phone. Your OZARA ID opens." },
      { title: "Unlock", body: "Access and perks at OZARA events." },
    ],
  },

  /* The three ideas behind the house */
  signature: {
    eyebrow: "Belonging",
    headline: "Worn by the few. Recognised by those who know.",
    ideas: [
      {
        kicker: "Recognised",
        title: "Known at a glance.",
        body: "The Eye is how OZARA holders know each other — across a room, at the door.",
      },
      {
        kicker: "Yours to keep",
        title: "Not for one night.",
        body: "A festival band is cut off and thrown away. Yours stays — the same bracelet, every OZARA event after.",
      },
      {
        kicker: "The few",
        title: "Registered, not mass-produced.",
        body: "Made in a first run, each one registered to its owner. Wearing one means you're part of OZARA.",
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
      { kicker: "The Eye", title: "More than a signature.", body: "The OZARA Eye is where your OZARA identity lives." },
      { kicker: "The tap", title: "Hold it to a phone.", body: "Your OZARA ID opens. No app, no battery, nothing to charge." },
    ],
  },

  /* UNDERSTAND → IDENTIFY → CONNECT */
  identity: {
    eyebrow: "Your OZARA ID",
    headline: ["Every bracelet", "*has an owner.*"],
    body: "Each OZARA comes with its own OZARA ID, registered to you. A tap shows it's genuine — and that it's yours.",
    journey: ["Your bracelet", "Your ID", "Genuine", "Yours", "Access"],
    disclaimer: "",
    /* The card's faces. "__featured__" is replaced with a piece name. */
    faces: [
      {
        key: "piece",
        tab: "Genuine",
        stop: 2,
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
      {
        key: "identity",
        tab: "Yours",
        stop: 3,
        line: "Registered to you. Shown only as you choose.",
        kicker: "Owner",
        title: { label: "Registered to", value: "Your initials" },
        code: "OZ — ●●●● ●●●●",
        mark: "tap",
        fields: [
          { label: "Owner since", value: "The day it's yours" },
          { label: "Piece", value: "__featured__" },
          { label: "Shown as", value: "Your choice" },
        ],
      },
      {
        key: "access",
        tab: "Your access",
        stop: 4,
        line: "The OZARA events your bracelet opens.",
        kicker: "Pass",
        title: { label: "Holder of", value: "Collection 01" },
        code: "ADMIT ONE",
        mark: "pass",
        fields: [
          { label: "Events", value: "Exclusive · Approved" },
          { label: "At the door", value: "Tap to enter" },
          { label: "Valid", value: "Every event after" },
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
    headline: ["You don't just attend.", "*You belong.*"],
    body: "The first run is being prepared.",
    waitlist: "Or join the list.",
  },

  /* Shared copy for every product page (/shop/[slug]). */
  productPage: {
    scroll: "Scroll to explore",
    customise: {
      eyebrow: "Customise with gemstones",
      title: "Add a touch of you.",
      body: "Two stones, set either side of the eye.",
      none: "Base Model",
      note: "Stones confirmed with you before making.",
    },
    eye: {
      eyebrow: "The eye",
      headline: ["Hold the eye", "*to a phone.*"],
      steps: [
        { title: "Hold", body: "No app needed." },
        { title: "Recognised", body: "Checked against our register." },
        { title: "Yours", body: "Authenticity, ownership, access." },
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
      shipping: "Made in the first run. Delivery method, cost and timing are confirmed before you pay.",
      care: "Store in its pouch. Wipe with a soft, dry cloth. Avoid perfume, chemicals and water. The tag needs no charging.",
      technology: "An NFC tag within. Hold the eye to a phone and its page opens. No battery, no GPS, no tracking.",
      returns: "Made to order. Terms are confirmed in writing before you pay — see our Terms.",
    },
    detailsEyebrow: "The piece",
    faqEyebrow: "Questions",
    faq: [
      { title: "When will the pieces be available?", body: "Launch timing will be shared with the waiting list first. Join it from this page to be notified." },
      { title: "What does the NFC do?", body: "A tap opens the bracelet's page and confirms it is authentic and registered." },
      { title: "Do I need an app?", body: "No. The tap opens a web page on most modern phones." },
      { title: "Is the technology visible?", body: "No. The tag sits within the bracelet; what you see is the jewellery and the eye." },
      { title: "Which sizes are offered?", body: "S, M and L. Materials and prices are confirmed before you pay." },
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
    body: "It wears like jewellery. Inside, an NFC tag gives each piece a record of its own.",
    chain: [
      { title: "The bracelet", body: "Jewellery, with the eye at its centre." },
      { title: "A unique identity", body: "Its own ID, registered before it leaves us." },
      { title: "Authentication", body: "A tap confirms it is ours, and active." },
      { title: "Ownership", body: "Registered to you. Shown only as initials." },
      { title: "Access", body: "Entry and perks at OZARA Exclusive and OZARA Approved events — with a tap, event after event." },
    ],
    honesty: {
      title: "What it does today — plainly.",
      body: "Today's tag carries a link with the bracelet's ID, checked against our register. It is not yet cryptographic, so unusual activity is reviewed. Tags that sign every tap are planned.",
    },
  },

  about: {
    eyebrow: "About",
    headline: ["Jewellery meets", "*technology.*"],
    intro: "A luxury bracelet, and the community it lets you into. Three designs, one sign: the Eye.",
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
    body: "The collection, events or press.",
    organisers: "Organising an OZARA event? Door staff verify bracelets at /verify with the code we provide.",
  },
};
