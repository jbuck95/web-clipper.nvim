# web-clipper.nvim

**DEMO**

https://github.com/user-attachments/assets/53ecbbb0-0cf1-446a-b920-5fa5950ef0bd

## Description

Clip websites into timestamped Markdown files with YAML frontmatter
for an Obsidian-compatible vault.

`:checkhealth web-clipper`  |  `:help web-clipper`

## Dependencies

- `node` -- JavaScript runtime
- `defuddle-clip.mjs` -- bundled in `bin/`, dependencies installed via `npm install` (see `bin/`)
- Clipboard tool (one of): `wl-paste`, `xclip`, `xsel`, `pbpaste`

## Install (lazy.nvim)

```lua
{
    "jbuck95/web-clipper.nvim",
    build = "npm install --prefix bin",
    config = function()
        require("web-clipper").setup({
            vault_dir = "~/Documents/clippings/",
            sites = {
                { name = "NASA APOD", url = "https://apod.nasa.gov/apod/", icon = "🌠" },
            },
        })
    end,
}
```

`setup()` is optional.

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

### Smart formatting (add to your `init.lua`)

Normal `gq` reflows YAML frontmatter, tables, and code blocks.
This keymap skips those structures. `gq` only touches prose paragraphs:

```lua
vim.api.nvim_create_autocmd("FileType", {
  pattern = "markdown",
  callback = function()
    vim.keymap.set("n", "<leader>gq", function()
      local lines = vim.api.nvim_buf_get_lines(0, 0, -1, false)
      local ranges, start_idx = {}, nil
      local in_yaml = lines[1] and lines[1]:match("^%-%-%-")
      local in_code = false

      for i, line in ipairs(lines) do
        local yaml_end = in_yaml and i > 1 and line:match("^%-%-%-")
        if yaml_end then in_yaml = false end

        local fence = line:match("^%s*```")
        if fence then in_code = not in_code end

        local ignore = in_yaml or yaml_end or in_code or fence
            or line:match("^%s*|")
            or line:match("!%[.-%]%(.-%)")
            or line:match("%[.-%]%(.-%)%s*$")

        if ignore then
          if start_idx then
            ranges[#ranges + 1] = { start_idx, i - 1 }
            start_idx = nil
          end
        elseif not start_idx and line:match("%S") then
          start_idx = i
        end
      end
      if start_idx then ranges[#ranges + 1] = { start_idx, #lines } end

      local view = vim.fn.winsaveview()
      local old_lz, old_ei = vim.o.lazyredraw, vim.o.eventignore
      vim.o.lazyredraw, vim.o.eventignore = true, "all"
      for _, r in ipairs(ranges) do
        if r[1] <= r[2] then
          vim.cmd(string.format("silent! noautocmd normal! %dGgq%dG", r[1], r[2]))
        end
      end
      vim.o.lazyredraw, vim.o.eventignore = old_lz, old_ei
      vim.fn.winrestview(view)
    end, { buffer = true, desc = "Smart gq (skip YAML/tables/code)" })
  end,
})
```

## Minimal config template

```lua
{
    "jbuck95/web-clipper.nvim",
    build = "npm install --prefix bin",
}
```

## Configuration

All fields are optional:

| Field           | Type     | Default                              | Description                       |
|-----------------|----------|--------------------------------------|-----------------------------------|
| `vault_dir`     | string   | `~/Documents/clippings/`             | Clipping output directory         |
| `clip_bin`      | string   | `<plugin>/bin/defuddle-clip.mjs`     | Path to defuddle-clip.mjs         |
| `clipboard_cmd` | string?  | auto-detected                        | Clipboard read command            |
| `sites`         | table    | `{}`                                 | Saved site shortcuts              |

Sites format: `{ name = "Label", url = "https://...", icon = "🔗" }`

## Troubleshooting

Clipped output looks wrong?

1. Edit `bin/defuddle-clip.mjs` — the full extraction pipeline is there
2. Run it directly: `node bin/defuddle-clip.mjs https://example.com`
3. Test in Neovim: `:WebClipper clip` and enter a URL

## Credits

Inspired by: [obsidian-clipper](https://github.com/obsidianmd/obsidian-clipper.git)

- [defuddle](https://github.com/kepano/defuddle) (MIT) – content extraction (Steph Ango)
- [turndown](https://github.com/mixmark-io/turndown) (MIT) – HTML to Markdown conversion
- [turndown-plugin-gfm](https://github.com/domchristie/turndown-plugin-gfm) (MIT) – GFM table/strikethrough support
- [jsdom](https://github.com/jsdom/jsdom) (MIT) – DOM manipulation

## Disclaimer

Built for my personal master's thesis workflow.
AI was used extensively in development.

## License

MIT
