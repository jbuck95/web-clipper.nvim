# web-clipper.nvim

Create .md file of Websites for saving content. (Obsidian-clipper alternative)

## Install (lazy)

```lua
return {
    "jbuck95/web-clipper.nvim",
    config = function()
        require("web-clipper").setup({
            vault_dir = "~/Documents/clippings/",
            clip_bin  = "~/bin/defuddle-clip.mjs",
            sites = {
                { name = "NASA APOD", url = "https://apod.nasa.gov/apod/", icon = "🌠" },
            },
        })
    end,
}
```
