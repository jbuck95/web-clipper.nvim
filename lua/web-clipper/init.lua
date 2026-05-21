---@class web-clipper.Site
---@field name string Display name of the site
---@field url  string URL to clip
---@field icon? string Optional icon (emoji or nerd font)

---@class web-clipper.Config
---@field vault_dir     string   Directory where .md clipping files are stored
---@field clip_bin      string   Path to defuddle-clip.mjs executable
---@field clipboard_cmd? string  System clipboard read command (auto-detected)
---@field sites         web-clipper.Site[] Pre-configured site shortcuts

local M = {}

local defaults = require("web-clipper.config.defaults")

---@type web-clipper.Config
local config = vim.deepcopy(defaults)

local function detect_clipboard()
	if vim.fn.executable("wl-paste") == 1 then
		return "wl-paste --no-newline 2>/dev/null"
	elseif vim.fn.executable("xclip") == 1 then
		return "xclip -o -selection clipboard 2>/dev/null"
	elseif vim.fn.executable("xsel") == 1 then
		return "xsel -b --output 2>/dev/null"
	elseif vim.fn.executable("pbpaste") == 1 then
		return "pbpaste 2>/dev/null"
	elseif vim.fn.executable("powershell.exe") == 1 then
		return "powershell.exe -Command Get-Clipboard 2>/dev/null"
	end
	return nil
end

---@param opts? web-clipper.Config
function M.setup(opts)
	opts = opts or {}
	local ok, err = pcall(function()
		vim.validate("vault_dir", opts.vault_dir, "string", true)
		vim.validate("clip_bin", opts.clip_bin, "string", true)
		vim.validate("clipboard_cmd", opts.clipboard_cmd, "string", true)
		vim.validate("sites", opts.sites, "table", true)
	end)
	if not ok then
		vim.notify("web-clipper: invalid config: " .. tostring(err), vim.log.levels.ERROR)
		return
	end
	config = vim.tbl_deep_extend("force", config, opts)
	config.vault_dir = vim.fn.expand(config.vault_dir)
	config.clip_bin = vim.fn.expand(config.clip_bin)
	if not config.clipboard_cmd then
		config.clipboard_cmd = detect_clipboard()
	end
end

local function clip_url(url)
	vim.notify("Clipping: " .. url, vim.log.levels.INFO)
	vim.fn.mkdir(config.vault_dir, "p")

	local tmpfile = vim.fn.tempname() .. ".md"
	local job_lines = {}

	vim.fn.jobstart({ config.clip_bin, url }, {
		stdout_buffered = true,
		on_stdout = function(_, data)
			if data then
				vim.list_extend(job_lines, data)
			end
		end,
		on_exit = function(_, code)
			if code ~= 0 then
				vim.notify("Clip failed (exit " .. code .. ")", vim.log.levels.ERROR)
				return
			end

			local title = "clipping"
			local metadata = {}
			for _, line in ipairs(job_lines) do
				local k, v = line:match('^([%w_]+):%s*"?(.-)"?%s*$')
				if k and v then metadata[k] = v end
			end

			if metadata.title and metadata.title ~= "" then
				title = metadata.title:gsub('[/\\:*?"<>|]', "-"):sub(1, 60)
			end

			local date = os.date("%Y-%m-%d")
			local outfile = config.vault_dir .. date .. " " .. title .. ".md"

			local final_lines = {
				"---",
				'id: "' .. date .. " " .. title .. '"',
				'title: "' .. (metadata.title or title) .. '"',
				'url: "' .. url .. '"',
				'author: "' .. (metadata.author or "") .. '"',
				'created: "' .. date .. '"',
				"tags:",
				"  - clipped",
				"aliases: []",
				"---",
				""
			}

			local body_started = false
			local dash_count = 0
			for _, line in ipairs(job_lines) do
				if not body_started then
					if line:match("^%-%-%-") then
						dash_count = dash_count + 1
					end
					if dash_count >= 2 and not line:match("^%-%-%-") then
						body_started = true
						table.insert(final_lines, line)
					end
				else
					table.insert(final_lines, line)
				end
			end

			vim.fn.writefile(final_lines, tmpfile)
			vim.fn.rename(tmpfile, outfile)

			vim.schedule(function()
				vim.cmd("edit " .. vim.fn.fnameescape(outfile))
				vim.notify("Saved & Synced: " .. outfile, vim.log.levels.INFO)
			end)
		end,
	})
end

---Clip a URL from visual selection, clipboard, or manual input.
---@return nil
function M.clip()
	local url = ""
	local mode = vim.fn.mode()

	if mode:match("^[vV\22]") then
		local lines = vim.fn.getregion(vim.fn.getpos("v"), vim.fn.getpos("."))
		url = table.concat(lines, ""):gsub("%s+$", "")
		vim.api.nvim_feedkeys(vim.api.nvim_replace_termcodes("<Esc>", true, false, true), "n", true)
	elseif config.clipboard_cmd then
		url = vim.fn.system(config.clipboard_cmd):gsub("%s+$", "")
	end

	if not url:match("^https?://") then
		url = vim.fn.input("URL: ")
	end

	if url == "" then return end

	clip_url(url)
end

---Open the site selector and clip the chosen URL.
---@return nil
function M.clip_site()
	if #config.sites == 0 then
		vim.notify("No sites configured in web-clipper.sites", vim.log.levels.WARN)
		return
	end

	vim.ui.select(config.sites, {
		prompt = "Clip from site:",
		format_item = function(site)
			return (site.icon and (site.icon .. " ") or "") .. site.name
		end,
	}, function(site)
		if site then clip_url(site.url) end
	end)
end

return M
