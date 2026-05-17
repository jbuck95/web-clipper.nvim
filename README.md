# web-clipper.nvim

Create .md file of Websites for saving content. (Obsidian-clipper alternative)

## Verify

`:checkhealth web-clipper`

## Dependencies

- `node` — JavaScript runtime
- `defuddle-clip.mjs` — bundled with plugin, place in `~/bin/`
- Clipboard tool (one of): `wl-paste`, `xclip`, `xsel`, `pbpaste`

## Install (lazy)

```lua
return {
    "jbuck95/web-clipper.nvim",
    config = function()
        require("web-clipper").setup({
            vault_dir = "~/Documents/clippings/",
            clip_bin  = "~/bin/defuddle-clip.mjs",
            sites = {           
            -- Here you can set links that don't change, e.g.: 
                { name = "NASA APOD", url = "https://apod.nasa.gov/apod/", icon = "🌠" },
            },
        })
    end,
}
```
