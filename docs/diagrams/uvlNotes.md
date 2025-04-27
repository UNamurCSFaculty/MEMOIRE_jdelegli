# How to export UVL properly

> If used from VSCode plugins, the procedure might differ on other supports

> /!\ Solution based on inkscape, you must install and configure it first

1. Generate SVG
2. Edit SVG and replace colors (darkmode workaround)

```
#1e1e1e => Carglass
white => #1e1e1e
Carglass => white
```

> Carglass is just a random word to eznsure it doesn't match anything else, used temporarily

3. Convert to PNG with inkscape

```
inkscape security-auth-features.svg --export-type=png --export-filename=security-auth-features.png
```

inkscape video-call-features.svg --export-type=png --export-filename=video-call-features.png
