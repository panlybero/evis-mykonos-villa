#!/usr/bin/env python3
"""Static site generator for Evi's Mykonos Villa.

No build step is required to *view* the site (it's plain HTML/CSS/JS),
but this script is used to generate the HTML pages from shared
header/footer templates so every page stays consistent.

Run:  python3 build.py
"""
import os

ROOT = os.path.dirname(os.path.abspath(__file__))
AIRBNB_URL = "https://airbnb.com/h/evismykonosvilla"
INSTAGRAM_URL = "https://www.instagram.com/mediterranean_mykonos_villa/"
EMAIL = "evismykonosvilla@gmail.com"

NAV_ITEMS = [
    ("summary", "Summary", "/summary/"),
    ("interior", "Interior", "/interior/"),
    ("bedrooms", "Bedrooms", "/bedrooms/"),
    ("location", "Location", "/location/"),
]
GALLERY_ITEMS = [
    ("pool", "Pool", "/pool/"),
    ("view", "View", "/view/"),
    ("seating", "Seating", "/seating/"),
    ("table", "Dining Table", "/table/"),
    ("bbq", "BBQ", "/bbq/"),
]


def nav_dropdown(label, items, active):
    open_cls = " open" if active in [k for k, _, _ in items] else ""
    links = "\n".join(
        '            <a href="{href}"{cls}>{label}</a>'.format(
            href=href,
            label=label,
            cls=' class="active"' if key == active else "",
        )
        for key, label, href in items
    )
    return '''        <li class="dropdown{open_cls}">
          <a href="#" class="nav-link">{label}</a>
          <div class="dropdown-menu">
{links}
          </div>
        </li>'''.format(open_cls=open_cls, label=label, links=links)


def header(active):
    about_dd = nav_dropdown("About", NAV_ITEMS, active)
    gallery_dd = nav_dropdown("Galleries", GALLERY_ITEMS, active)
    contact_cls = ' class="nav-link active"' if active == "contact" else ' class="nav-link"'
    home_cls = ' class="nav-link active"' if active == "home" else ' class="nav-link"'
    return '''  <header class="site-header">
    <div class="nav-wrap">
      <a href="/" class="brand">Evi&rsquo;s <span>Mykonos Villa</span></a>
      <nav class="main-nav">
        <ul>
          <li><a href="/"{home_cls}>Home</a></li>
{about_dd}
{gallery_dd}
          <li><a href="/contact/"{contact_cls}>Contact</a></li>
        </ul>
        <div class="nav-cta">
          <a href="{airbnb}" class="btn btn-primary" target="_blank" rel="noopener">Book Here</a>
        </div>
      </nav>
      <button class="nav-toggle" aria-label="Toggle menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>'''.format(
        home_cls=home_cls,
        about_dd=about_dd,
        gallery_dd=gallery_dd,
        contact_cls=contact_cls,
        airbnb=AIRBNB_URL,
    )


def footer():
    return '''  <footer class="site-footer">
    <div class="container">
      <div class="footer-inner">
        <div class="footer-brand">Evi&rsquo;s Mykonos Villa</div>
        <ul class="footer-links">
          <li><a href="/summary/">About</a></li>
          <li><a href="/pool/">Galleries</a></li>
          <li><a href="/contact/">Contact</a></li>
          <li><a href="{airbnb}" target="_blank" rel="noopener">Book on Airbnb</a></li>
          <li><a href="{instagram}" target="_blank" rel="noopener">Instagram</a></li>
        </ul>
      </div>
      <div class="footer-bottom">
        <span>Ano Mera, Mykonos, 84600 &middot; <a href="mailto:{email}">{email}</a></span>
        <span>&copy; <span id="year"></span> Evi&rsquo;s Mykonos Villa</span>
      </div>
    </div>
  </footer>
  <script>document.getElementById('year').textContent = new Date().getFullYear();</script>'''.format(
        airbnb=AIRBNB_URL, instagram=INSTAGRAM_URL, email=EMAIL
    )


def page(active, title, description, content, extra_head=""):
    return '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<meta name="description" content="{description}">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/style.css">
{extra_head}
</head>
<body>
{header}
  <main>
{content}
  </main>
{footer}
  <script src="/assets/js/main.js"></script>
</body>
</html>
'''.format(
        title=title,
        description=description,
        extra_head=extra_head,
        header=header(active),
        content=content,
        footer=footer(),
    )


def write_page(path, html):
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w") as f:
        f.write(html)
    print("Wrote", path)


# ---------------------------------------------------------------------------
# Page content
# ---------------------------------------------------------------------------

def newsletter_block(heading="Subscribe", note="Sign up with your email address to receive news and photos."):
    return '''    <section class="newsletter">
      <div class="container">
        <h2>{heading}</h2>
        <p>{note}</p>
        <form class="newsletter-form" action="https://formspree.io/f/your-form-id" method="POST">
          <input type="email" name="email" placeholder="Your email address" required>
          <button type="submit" class="btn btn-primary">Sign Up</button>
        </form>
        <p class="newsletter-note">We respect your privacy and will never share your email.</p>
      </div>
    </section>'''.format(heading=heading, note=note)


def crosslink(text, href, cta):
    return '''    <section class="crosslink">
      <div class="container">
        <h3>{text}</h3>
        <a href="{href}" class="btn btn-outline">{cta}</a>
      </div>
    </section>'''.format(text=text, href=href, cta=cta)


def build_home():
    content = '''    <section class="hero" style="background-image:url('/assets/img/home/mykonos_front.jpg')">
      <div class="hero-inner">
        <h4>Your Dream Vacation</h4>
        <h1>Starts Here</h1>
        <p>A villa with breathtaking view and a private pool, in the south side of Mykonos &mdash; peaceful, close to the island's best beaches and a short ride from Chora.</p>
        <div class="hero-actions">
          <a href="{airbnb}" class="btn btn-primary" target="_blank" rel="noopener">Book Here</a>
          <a href="/summary/" class="btn btn-outline">Learn More</a>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-header">
          <h3>Experience Mykonos as YOU desire</h3>
          <p>A villa with breathtaking view and a private pool located in the south side of the island. Enjoy unique peace and quiet while at close proximity to the world-renowned beaches of the south, the unexplored southeast side of the island and a short ride away from the famous and lively Matogianni in Chora.</p>
        </div>

        <div class="section-stack">
          <div class="feature-grid">
            <div class="feature-media"><img src="/assets/img/home/IMG_20220617_194614_1920_1080.jpg" alt="View from the villa"></div>
            <div class="feature-text">
              <h4>The View</h4>
              <h3>Your Breathtaking View</h3>
              <p>Enjoy a view like no other &mdash; rolling hills, the Aegean sea and endless sky, right from your terrace.</p>
              <a href="/view/" class="btn btn-outline-dark">See more</a>
            </div>
          </div>

          <div class="feature-grid reverse">
            <div class="feature-media"><img src="/assets/img/home/pool.jpeg" alt="Private pool"></div>
            <div class="feature-text">
              <h4>The Pool</h4>
              <h3>Your Private Pool</h3>
              <p>A fully private pool to help you relax and cool off during warm Mykonos days.</p>
              <a href="/pool/" class="btn btn-outline-dark">See more</a>
            </div>
          </div>

          <div class="feature-grid">
            <div class="feature-media"><img src="/assets/img/home/dining.jpeg" alt="Dining area"></div>
            <div class="feature-text">
              <h4>Dining</h4>
              <h3>Your Dining Area</h3>
              <p>A 14 seat dining table with breath-taking view to host friends and family for unforgettable evenings.</p>
              <a href="/table/" class="btn btn-outline-dark">See more</a>
            </div>
          </div>

          <div class="feature-grid reverse">
            <div class="feature-media"><img src="/assets/img/home/seating.jpeg" alt="Lounge seating"></div>
            <div class="feature-text">
              <h4>Lounge</h4>
              <h3>Your All-Day Lounge</h3>
              <p>Comfortable sofas by the pool with views as far as the eye can see.</p>
              <a href="/seating/" class="btn btn-outline-dark">See more</a>
            </div>
          </div>

          <div class="feature-grid">
            <div class="feature-media"><img src="/assets/img/home/bbq.jpeg" alt="Private BBQ"></div>
            <div class="feature-text">
              <h4>BBQ</h4>
              <h3>Your Private BBQ</h3>
              <p>A fully equipped brick charcoal barbecue for splendid dinners of local delicacies.</p>
              <a href="/bbq/" class="btn btn-outline-dark">See more</a>
            </div>
          </div>

          <div class="feature-grid reverse">
            <div class="feature-media"><img src="/assets/img/home/saloni.jpeg" alt="Living room"></div>
            <div class="feature-text">
              <h4>Interior</h4>
              <h3>Your Interior Life</h3>
              <p>Comfortable bedrooms, a picturesque living room and a fully equipped kitchen to serve all your needs.</p>
              <a href="/interior/" class="btn btn-outline-dark">See more</a>
            </div>
          </div>
        </div>
      </div>
    </section>

{newsletter}'''.format(airbnb=AIRBNB_URL, newsletter=newsletter_block())

    write_page("index.html", page(
        "home",
        "Evi's Mykonos Villa \u2014 Your Dream Vacation Starts Here",
        "A villa with breathtaking view and a private pool in the south side of Mykonos, Greece.",
        content,
    ))


def build_summary():
    content = '''    <section class="hero page-hero" style="background-image:url('/assets/img/summary/welcome.jpg')">
      <div class="hero-inner">
        <h1>At a Glance</h1>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-stack">
          <div class="feature-grid">
            <div class="feature-media"><img src="/assets/img/summary/map.jpg" alt="Map of the villa's location on Mykonos"></div>
            <div class="feature-text">
              <h4>Location</h4>
              <h3>Your Location</h3>
              <p>The villa is located in the south side of the island, only a short drive away from the village of Ano Mera and countless beautiful beaches.</p>
              <a href="/location/" class="btn btn-outline-dark">View location</a>
            </div>
          </div>

          <div class="feature-grid reverse">
            <div class="feature-media"><img src="/assets/img/summary/master_bed.jpeg" alt="Master bedroom"></div>
            <div class="feature-text">
              <h4>Space</h4>
              <h3>Your Space</h3>
              <p>6 bedrooms with bathrooms ensuite, accommodating up to 10 people.</p>
              <a href="/bedrooms/" class="btn btn-outline-dark">See the bedrooms</a>
            </div>
          </div>

          <div class="feature-grid">
            <div class="feature-media"><img src="/assets/img/summary/glasses.jpeg" alt="Welcome amenities"></div>
            <div class="feature-text">
              <h4>Amenities</h4>
              <h3>Your Amenities</h3>
              <p>Enjoy a selection of complementary offerings from your host Evi.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

{crosslink}'''.format(crosslink=crosslink("Curious about the interior?", "/interior/", "Explore the Interior"))

    write_page("summary/index.html", page(
        "summary",
        "At a Glance \u2014 Evi's Mykonos Villa",
        "6 bedrooms, private pool, and a prime location in the south side of Mykonos.",
        content,
    ))


def build_interior():
    content = '''    <section class="hero page-hero" style="background-image:url('/assets/img/interior/saloni.jpeg')">
      <div class="hero-inner">
        <h1>Interior Space</h1>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-stack">
          <div class="feature-grid">
            <div class="feature-media"><img src="/assets/img/interior/saloni.jpeg" alt="Living room"></div>
            <div class="feature-text">
              <h4>Living Room</h4>
              <h3>Your Stylish Living Room</h3>
              <p>Mixing traditional picturesque elements with a modern aesthetic, the living room offers comfortable sofas, plenty of light and easy access to the pool area.</p>
            </div>
          </div>

          <div class="feature-grid reverse">
            <div class="feature-media"><img src="/assets/img/interior/kitchen.jpeg" alt="Kitchen"></div>
            <div class="feature-text">
              <h4>Kitchen</h4>
              <h3>Your Inspiring Kitchen</h3>
              <p>A fully equipped kitchen to serve all your breakfast, lunch and dinner needs.</p>
            </div>
          </div>

          <div class="feature-grid">
            <div class="feature-media"><img src="/assets/img/interior/livingroombath.jpeg" alt="Living room bathroom"></div>
            <div class="feature-text">
              <h4>Bathroom</h4>
              <h3>Supporting WC</h3>
              <p>A beautiful bathroom independent of all bedrooms to support the living room at all times.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

{crosslink}
{newsletter}'''.format(
        crosslink=crosslink("Looking for Bedrooms?", "/bedrooms/", "See the Bedrooms"),
        newsletter=newsletter_block("Stay in the loop", "Sign up with your email address to receive news and updates."),
    )

    write_page("interior/index.html", page(
        "interior",
        "Interior \u2014 Evi's Mykonos Villa",
        "A stylish living room, inspiring kitchen and elegant interior spaces at Evi's Mykonos Villa.",
        content,
    ))


def build_bedrooms():
    rooms = [
        ("master_bed", "master_bath", "master_hall", "Your Master Bedroom 1",
         "Sunny and bright, this beautiful master bedroom on the ground floor has direct access to the pool, fantastic view and a luxurious private bath. Sleeps 1-2."),
        ("master2_bed", "master2_bath", "master2_hall", "Your Master Bedroom 2",
         "The largest of the two master bedrooms, this 1st floor room offers magnificent sea view, a private study and a private balcony. Sleeps 1-2."),
        ("suite_bed", "suite_bath", "suite_hall", "Your Suite",
         "This first floor suite is unique in the villa as it offers the largest space and bathroom, an east-facing private balcony and an independent entrance to the villa. Sleeps 1-4."),
        ("loukas_bed", "loukas_bath", "betweenbed", "Your Double Bedroom",
         "This ground floor double bedroom is perhaps the coziest in the villa, making it perfect for couples. It has easy access to the kitchen, a beautiful bed and a private bathroom with hydromassage-ready shower. Sleeps 1-2."),
        ("pan_bed", "pan_bath", "pan_balcony", "Your Versatile Bedroom",
         "Featuring both a double convertible couch-bed and a single twin bed, this room is perfect for friends, families and children alike. Also features private bath with hydromassage-ready shower. Sleeps 1-3."),
        ("anna_bed", "anna_bath", None, "Your Single Bedroom",
         "This first-floor single room is the hidden gem of the villa. Incredibly bright, with 2 private balconies featuring magnificent sea and pool view and private bath. Sleeps 1."),
    ]

    cards = []
    for bed_img, bath_img, extra_img, title, desc in rooms:
        cards.append('''          <div class="card">
            <img src="/assets/img/bedrooms/{bed}.jpeg" alt="{title}">
            <div class="card-body">
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          </div>'''.format(bed=bed_img, title=title, desc=desc))

    content = '''    <section class="hero page-hero" style="background-image:url('/assets/img/bedrooms/master_bed.jpeg')">
      <div class="hero-inner">
        <h1>Your Bedrooms</h1>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="card-grid">
{cards}
        </div>
      </div>
    </section>

{crosslink}
{newsletter}'''.format(
        cards="\n".join(cards),
        crosslink=crosslink("Looking for Interior Spaces?", "/interior/", "See the Interior"),
        newsletter=newsletter_block("Subscribe to Our Newsletter", "Sign up with your email address to receive news and updates."),
    )

    write_page("bedrooms/index.html", page(
        "bedrooms",
        "Bedrooms \u2014 Evi's Mykonos Villa",
        "6 bedrooms with ensuite bathrooms, accommodating up to 10 people at Evi's Mykonos Villa.",
        content,
    ))


def build_location():
    content = '''    <section class="hero page-hero" style="background-image:url('/assets/img/summary/map.jpg')">
      <div class="hero-inner">
        <h1>Location</h1>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-header" style="margin-bottom:2em;">
          <h3>Ano Mera, Mykonos</h3>
          <p>The villa is located in the south side of Mykonos, only a short drive from the village of Ano Mera and countless beautiful beaches &mdash; peaceful and private, yet close to everything the island has to offer.</p>
        </div>
        <iframe class="map-embed" loading="lazy" allowfullscreen
          src="https://www.google.com/maps?q=Ano+Mera,+Mykonos+840+00,+Greece&output=embed">
        </iframe>
      </div>
    </section>

{crosslink}'''.format(crosslink=crosslink("Ready to see more?", "/summary/", "Back to Overview"))

    write_page("location/index.html", page(
        "location",
        "Location \u2014 Evi's Mykonos Villa",
        "Find Evi's Mykonos Villa in Ano Mera, on the south side of Mykonos, Greece.",
        content,
    ))


GALLERY_CONTENT = {
    "pool": ("Pool", "Your Private Pool", 10, "jpg"),
    "view": ("View", "Your Breathtaking View", 7, "jpg"),
    "seating": ("Seating", "Your All-Day Lounge", 8, "jpg"),
    "table": ("Dining Table", "Your Dining Area", 4, "jpeg"),
    "bbq": ("BBQ", "Your Private BBQ", 4, "jpeg"),
}


def build_gallery(key):
    import glob
    title, heading, _, _ = GALLERY_CONTENT[key]
    img_dir = os.path.join(ROOT, "assets", "img", key)
    files = sorted(os.listdir(img_dir))
    items = []
    for fname in files:
        src = "/assets/img/{}/{}".format(key, fname)
        items.append('''          <a href="{src}" data-lightbox>
            <img src="{src}" alt="{heading}" loading="lazy">
          </a>'''.format(src=src, heading=heading))

    content = '''    <section class="hero page-hero" style="background-image:url('/assets/img/{key}/{first}')">
      <div class="hero-inner">
        <h1>{heading}</h1>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="gallery-grid">
{items}
        </div>
      </div>
    </section>

{crosslink}'''.format(
        key=key,
        first=files[0],
        heading=heading,
        items="\n".join(items),
        crosslink=crosslink("Ready to book your stay?", AIRBNB_URL, "Book on Airbnb"),
    )

    write_page("{}/index.html".format(key), page(
        key,
        "{} \u2014 Evi's Mykonos Villa".format(title),
        "{} photo gallery of Evi's Mykonos Villa.".format(title),
        content,
    ))


def build_contact():
    content = '''    <section class="hero page-hero" style="background-image:url('/assets/img/contact/balcony.jpeg')">
      <div class="hero-inner">
        <h1>Contact</h1>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="contact-grid">
          <div class="contact-list">
            <h3>Reach out to us today.</h3>

            <div class="contact-item">
              <h4>Bookings</h4>
              <a class="value" href="{airbnb}" target="_blank" rel="noopener">Book on Airbnb &rarr;</a>
            </div>

            <div class="contact-item">
              <h4>General Inquiries</h4>
              <a class="value" href="mailto:{email}">{email}</a>
            </div>

            <div class="contact-item">
              <h4>Instagram</h4>
              <a class="value" href="{instagram}" target="_blank" rel="noopener">&#64;mediterranean_mykonos_villa</a>
            </div>
          </div>
          <div class="contact-media">
            <img src="/assets/img/contact/balcony.jpeg" alt="Villa balcony">
          </div>
        </div>
      </div>
    </section>'''.format(airbnb=AIRBNB_URL, email=EMAIL, instagram=INSTAGRAM_URL)

    write_page("contact/index.html", page(
        "contact",
        "Contact \u2014 Evi's Mykonos Villa",
        "Get in touch with Evi's Mykonos Villa for bookings and general inquiries.",
        content,
    ))


if __name__ == "__main__":
    build_home()
    build_summary()
    build_interior()
    build_bedrooms()
    build_location()
    for key in GALLERY_CONTENT:
        build_gallery(key)
    build_contact()
    print("\nDone.")
