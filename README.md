# web-clipper.nvim

Clip websites into timestamped Markdown files with YAML frontmatter
for an Obsidian-compatible vault.

`:checkhealth web-clipper`  |  `:help web-clipper`

## Dependencies

- `node` -- JavaScript runtime
- `defuddle-clip.mjs` -- place in `~/bin/` (or configure `clip_bin`)
- Clipboard tool (one of): `wl-paste`, `xclip`, `xsel`, `pbpaste`

## Install (lazy.nvim)

```lua
{
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

`setup()` is optional -- the plugin works out of the box with defaults.

## Usage

### Commands

`:WebClipper clip` -- Clip a URL (visual selection, clipboard, or prompt)
`:WebClipper clip_site` -- Choose from configured sites

### Keymaps

Map the `<Plug>` bindings to keys of your choice:

```lua
vim.keymap.set({ "n", "v" }, "<leader>mc", "<Plug>(WebClipperClip)")
vim.keymap.set("n", "<leader>ml", "<Plug>(WebClipperClipSite)")
```

### Lua API

```lua
require("web-clipper").clip()
require("web-clipper").clip_site()
```

## Minimal config template

```lua
{
    "jbuck95/web-clipper.nvim",
}
```

## Configuration

All fields are optional:

| Field           | Type     | Default                              | Description                       |
|-----------------|----------|--------------------------------------|-----------------------------------|
| `vault_dir`     | string   | `~/Documents/clippings/`             | Clipping output directory         |
| `clip_bin`      | string   | `~/bin/defuddle-clip.mjs`            | Path to defuddle-clip.mjs         |
| `clipboard_cmd` | string?  | auto-detected                        | Clipboard read command            |
| `sites`         | table    | `{}`                                 | Saved site shortcuts              |

Sites format: `{ name = "Label", url = "https://...", icon = "🔗" }`
