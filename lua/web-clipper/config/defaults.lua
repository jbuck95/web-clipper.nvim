---@class web-clipper.Site
---@field name string Display name of the site
---@field url  string URL to clip
---@field icon? string Optional icon (emoji or nerd font)

---@class web-clipper.Config
---@field vault_dir     string   Directory where .md clipping files are stored
---@field clip_bin      string   Path to defuddle-clip.mjs executable
---@field clipboard_cmd? string  System clipboard read command (auto-detected)
---@field sites         web-clipper.Site[] Pre-configured site shortcuts

local plugin_root = vim.fn.fnamemodify(debug.getinfo(1, "S").source:sub(2), ":h:h:h:h")

---@type web-clipper.Config
return {
	vault_dir = vim.fn.expand("~/Documents/clippings/"),
	clip_bin = plugin_root .. "/bin/defuddle-clip.mjs",
	sites = {},
}
