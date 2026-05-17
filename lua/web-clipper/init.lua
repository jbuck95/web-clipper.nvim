local M = {}

local config = {
	vault_dir = vim.fn.expand("~/Documents/clippings/"),
	clip_bin  = vim.fn.expand("~/bin/defuddle-clip.mjs"),
	sites = {},
}

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

M.setup = function(opts)
	opts = opts or {}
	config.vault_dir = vim.fn.expand(opts.vault_dir or config.vault_dir)
	config.clip_bin = vim.fn.expand(opts.clip_bin or config.clip_bin)
	config.clipboard_cmd = opts.clipboard_cmd or detect_clipboard()
	config.sites = opts.sites or {}

	vim.keymap.set({ "n", "v" }, "<leader>mc", M.clip, { desc = "Web Clip" })
	vim.keymap.set("n", "<leader>ml", M.clip_site, { desc = "Clip from List" })
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

M.clip = function()
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

M.clip_site = function()
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
