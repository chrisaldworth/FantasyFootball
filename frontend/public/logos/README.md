# Team Logos & Icons

This directory contains team logos and icons for the Fotmate platform.

## Directory Structure

```
logos/
├── teams/              # Premier League team logos (SVG format)
│   ├── 1-arsenal.svg
│   ├── 2-aston-villa.svg
│   └── ... (all 20 teams)
├── icons/              # Application icons
│   ├── match.svg
│   ├── player.svg
│   └── ...
├── generated/          # Generated/logos (temporary)
│   └── review/         # Review folder for new logos before integration
│       ├── team-logos/
│       └── icons/
└── README.md           # This file
```

## Naming Convention

### Team Logos
- Format: `{team-id}-{team-name}.svg`
- Example: `1-arsenal.svg`, `12-liverpool.svg`
- Team IDs correspond to FPL team IDs (1-20)

### Icons
- Format: `{icon-name}.svg`
- Example: `match.svg`, `player.svg`, `trophy.svg`

## Team ID Reference

FPL Team IDs (2024/25 season):
1. Arsenal
2. Aston Villa
3. Bournemouth
4. Brentford
5. Brighton
6. Chelsea
7. Crystal Palace
8. Everton
9. Fulham
10. Ipswich
11. Leicester
12. Liverpool
13. Manchester City
14. Manchester Utd
15. Newcastle
16. Nottingham Forest
17. Southampton
18. Tottenham
19. West Ham
20. Wolves

## Adding New Logos

1. Generate logo using recommended tools (see `docs/assets/logo-icon-generation-guide.md`)
2. Place in `generated/review/team-logos/` or `generated/review/icons/`
3. Review logo at various sizes (32px, 64px, 128px, 256px)
4. Ensure SVG format and proper dimensions
5. Move to final location (`teams/` or `icons/`)
6. Update component code to use new logo

## Review Checklist

Before moving logos from review to final location:
- [ ] Logo works at small sizes (32x32px)
- [ ] Logo works at large sizes (256x256px)
- [ ] Colors match team brand
- [ ] SVG format (scalable)
- [ ] Transparent background
- [ ] Clear on light backgrounds
- [ ] Clear on dark backgrounds
- [ ] No copyrighted material
- [ ] Consistent style with other logos

## Resources

- **Generation Guide**: `docs/assets/logo-icon-generation-guide.md`
- **Team Colors**: See `frontend/src/components/TeamLogoGenerated.tsx`
- **Component Usage**: See `frontend/src/components/TeamLogo.tsx`

