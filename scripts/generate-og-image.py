"""Generate OG image (1200x630) and App Store screenshot placeholders for TRACKVOLT."""
from PIL import Image, ImageDraw, ImageFont
import os

OUT = os.path.join(os.path.dirname(__file__), '..', 'public')

def get_font(size):
    """Try to load a good font, fallback to default."""
    paths = [
        '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
        '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
        '/usr/share/fonts/truetype/freefont/FreeSansBold.ttf',
    ]
    for p in paths:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def get_font_regular(size):
    paths = [
        '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
        '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
        '/usr/share/fonts/truetype/freefont/FreeSans.ttf',
    ]
    for p in paths:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def draw_gradient(img, color_top, color_bottom):
    """Draw vertical gradient."""
    draw = ImageDraw.Draw(img)
    w, h = img.size
    for y in range(h):
        r = int(color_top[0] + (color_bottom[0] - color_top[0]) * y / h)
        g = int(color_top[1] + (color_bottom[1] - color_top[1]) * y / h)
        b = int(color_top[2] + (color_bottom[2] - color_top[2]) * y / h)
        draw.line([(0, y), (w, y)], fill=(r, g, b))


def draw_glow(draw, cx, cy, radius, color, alpha_max=60):
    """Draw a soft glow circle."""
    for i in range(radius, 0, -2):
        alpha = int(alpha_max * (i / radius))
        draw.ellipse([cx - i, cy - i, cx + i, cy + i],
                     fill=(color[0], color[1], color[2], alpha))


def generate_og_image():
    """1200x630 Open Graph image."""
    w, h = 1200, 630
    img = Image.new('RGBA', (w, h))
    draw_gradient(img, (2, 6, 23), (15, 23, 42))  # slate-950 to slate-900
    draw = ImageDraw.Draw(img)

    # Cyan accent glow
    glow_layer = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_layer)
    draw_glow(glow_draw, 900, 315, 300, (34, 211, 238), 40)
    img = Image.alpha_composite(img, glow_layer)
    draw = ImageDraw.Draw(img)

    # Brand name
    font_brand = get_font(72)
    draw.text((80, 120), 'TRACKVOLT', fill=(34, 211, 238), font=font_brand)

    # Tagline
    font_tag = get_font(36)
    draw.text((80, 210), 'Your Hybrid Athlete', fill=(241, 245, 249), font=font_tag)
    draw.text((80, 255), 'Operating System', fill=(241, 245, 249), font=font_tag)

    # Features
    font_feat = get_font_regular(22)
    features = [
        'Log any WOD in seconds',
        'Track PRs automatically',
        'Nail your nutrition macros',
        'Sync training with your cycle',
        'Works offline. Always.',
    ]
    y = 340
    for feat in features:
        # Cyan bullet
        draw.ellipse([84, y + 6, 96, y + 18], fill=(34, 211, 238))
        draw.text((110, y), feat, fill=(148, 163, 184), font=font_feat)
        y += 36

    # Right side — mock phone outline
    phone_x, phone_y = 780, 80
    phone_w, phone_h = 320, 470
    # Phone body
    draw.rounded_rectangle(
        [phone_x, phone_y, phone_x + phone_w, phone_y + phone_h],
        radius=24, outline=(51, 65, 85), width=2
    )
    # Screen area
    draw.rounded_rectangle(
        [phone_x + 8, phone_y + 8, phone_x + phone_w - 8, phone_y + phone_h - 8],
        radius=18, fill=(15, 23, 42)
    )
    # Mock UI elements inside phone
    sx, sy = phone_x + 24, phone_y + 32
    # Greeting
    draw.text((sx, sy), 'Good morning, Athlete', fill=(148, 163, 184), font=get_font_regular(14))
    draw.text((sx, sy + 22), 'Mon, Mar 2', fill=(241, 245, 249), font=get_font(20))
    # Streak badge
    draw.rounded_rectangle([sx + 200, sy + 2, sx + 270, sy + 30], radius=12, fill=(249, 115, 22, 40))
    draw.text((sx + 215, sy + 7), '7d', fill=(251, 146, 60), font=get_font(14))
    # Mock cards
    card_y = sy + 60
    for i, (label, color) in enumerate([
        ('Today\'s Training', (34, 211, 238)),
        ('Macros', (74, 222, 128)),
        ('Recovery', (96, 165, 250)),
    ]):
        draw.rounded_rectangle(
            [sx, card_y, sx + 268, card_y + 55],
            radius=12, outline=(51, 65, 85, 100), width=1
        )
        draw.text((sx + 12, card_y + 8), label, fill=(148, 163, 184), font=get_font_regular(11))
        # Color bar
        bar_w = int(268 * (0.7 - i * 0.15))
        draw.rounded_rectangle(
            [sx + 12, card_y + 32, sx + 12 + bar_w, card_y + 40],
            radius=4, fill=color
        )
        card_y += 68

    # Tab bar mock
    tab_y = phone_y + phone_h - 50
    draw.line([(phone_x + 8, tab_y), (phone_x + phone_w - 8, tab_y)], fill=(51, 65, 85), width=1)
    tabs_x = [sx + 20, sx + 75, sx + 130, sx + 185, sx + 240]
    for i, tx in enumerate(tabs_x):
        color = (34, 211, 238) if i == 0 else (100, 116, 139)
        draw.ellipse([tx, tab_y + 12, tx + 12, tab_y + 24], fill=color)

    # Bottom tagline
    draw.text((80, 560), 'Free • Offline-First • PWA', fill=(100, 116, 139), font=get_font_regular(18))

    img = img.convert('RGB')
    img.save(os.path.join(OUT, 'og-image.png'), quality=95)
    print('og-image.png generated (1200x630)')


def generate_screenshot(filename, headline, subhead, accent_color, features, w=1290, h=2796):
    """Generate an App Store style screenshot."""
    img = Image.new('RGBA', (w, h))
    draw_gradient(img, (2, 6, 23), (15, 23, 42))
    draw = ImageDraw.Draw(img)

    # Glow
    glow = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    draw_glow(glow_draw, w // 2, h // 3, 500, accent_color, 30)
    img = Image.alpha_composite(img, glow)
    draw = ImageDraw.Draw(img)

    # Headline
    font_h = get_font(96)
    font_sub = get_font_regular(48)

    # Center headline
    bbox = draw.textbbox((0, 0), headline, font=font_h)
    tw = bbox[2] - bbox[0]
    draw.text(((w - tw) // 2, 200), headline, fill=(241, 245, 249), font=font_h)

    # Subhead
    bbox = draw.textbbox((0, 0), subhead, font=font_sub)
    tw = bbox[2] - bbox[0]
    draw.text(((w - tw) // 2, 320), subhead, fill=(148, 163, 184), font=font_sub)

    # Features list
    font_feat = get_font_regular(36)
    y = 500
    for feat in features:
        draw.ellipse([180, y + 10, 200, y + 30], fill=accent_color)
        draw.text((220, y), feat, fill=(203, 213, 225), font=font_feat)
        y += 60

    # Mock phone area (bottom 60%)
    phone_w, phone_h = 900, 1600
    px = (w - phone_w) // 2
    py = h - phone_h - 100

    # Phone body
    draw.rounded_rectangle(
        [px, py, px + phone_w, py + phone_h],
        radius=48, outline=(51, 65, 85), width=3
    )
    draw.rounded_rectangle(
        [px + 12, py + 12, px + phone_w - 12, py + phone_h - 12],
        radius=40, fill=(15, 23, 42)
    )

    # Simplified mock content inside phone
    cx, cy = px + 60, py + 80
    for i in range(5):
        card_h = 120
        card_color = (30, 41, 59, 180)
        draw.rounded_rectangle(
            [cx, cy, cx + phone_w - 120, cy + card_h],
            radius=24, fill=card_color
        )
        # Bar inside card
        bar_w = int((phone_w - 180) * (0.8 - i * 0.1))
        draw.rounded_rectangle(
            [cx + 20, cy + card_h - 30, cx + 20 + bar_w, cy + card_h - 18],
            radius=6, fill=accent_color + (120,)
        )
        cy += card_h + 20

    # Bottom brand
    font_brand = get_font(42)
    bbox = draw.textbbox((0, 0), 'TRACKVOLT', font=font_brand)
    tw = bbox[2] - bbox[0]
    draw.text(((w - tw) // 2, h - 80), 'TRACKVOLT', fill=(34, 211, 238, 150), font=font_brand)

    img = img.convert('RGB')
    path = os.path.join(OUT, 'screenshots', filename)
    img.save(path, quality=92)
    print(f'{filename} generated ({w}x{h})')


# Generate all assets
generate_og_image()

generate_screenshot(
    'today-dashboard.png',
    'Your Day at a Glance',
    'Streak, recovery, workout, nutrition — all in one view',
    (34, 211, 238),
    ['Recovery score from sleep + training', 'Streak tracking with milestones', 'Smart workout suggestions', 'Cycle-synced training recs']
)

generate_screenshot(
    'workout-log.png',
    'Log Any WOD',
    'AMRAP, EMOM, For Time, Strength — in seconds',
    (74, 222, 128),
    ['Auto-detects workout type', 'Tracks movements and loads', 'PR detection built-in', 'RX / Scaled / Elite tags']
)

generate_screenshot(
    'nutrition-macros.png',
    'Nail Your Nutrition',
    'Protein, carbs, fat — visual and simple',
    (251, 146, 60),
    ['Barcode & AI food scanning', 'Per-meal macro breakdown', 'Daily calorie targets', 'Grocery list integration']
)

generate_screenshot(
    'progress-prs.png',
    'Watch Your Gains',
    'Personal records, charts, and training history',
    (248, 113, 113),
    ['Movement PR timeline', 'Body composition trends', 'Weekly training volume', '50+ achievement badges']
)

print('\nAll ASO assets generated!')
