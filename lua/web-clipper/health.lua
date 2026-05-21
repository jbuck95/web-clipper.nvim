local M = {}

function M.check()
	vim.health.start("web-clipper")

	local ok, mod = pcall(require, "web-clipper")
	if not ok then
		vim.health.error("module failed to load: " .. tostring(mod))
		return
	end

	if type(mod.clip) == "function" and type(mod.clip_site) == "function" then
		vim.health.ok("module loaded successfully")
	else
		vim.health.error("module API incomplete")
	end

	if vim.fn.executable("node") == 1 then
		vim.health.ok("node")
	else
		vim.health.error("node not found (required for defuddle-clip)")
	end

	local clip_bin = vim.fn.stdpath("config") .. "/dev/web-clipper.nvim/bin/defuddle-clip.mjs"
	if vim.fn.filereadable(clip_bin) == 1 then
		vim.health.ok(clip_bin)
	else
		vim.health.error(clip_bin .. " not found (core clipper script)")
	end

	local clip_tool = nil
	if vim.fn.executable("wl-paste") == 1 then
		clip_tool = "wl-paste"
	elseif vim.fn.executable("xclip") == 1 then
		clip_tool = "xclip"
	elseif vim.fn.executable("xsel") == 1 then
		clip_tool = "xsel"
	elseif vim.fn.executable("pbpaste") == 1 then
		clip_tool = "pbpaste"
	elseif vim.fn.executable("powershell.exe") == 1 then
		clip_tool = "powershell.exe Get-Clipboard"
	end

	if clip_tool then
		vim.health.ok("clipboard: " .. clip_tool .. " (auto-detected)")
	else
		vim.health.warn("no clipboard tool found -- URL input falls back to manual prompt")
	end

	if vim.fn.isdirectory(vim.fn.expand("~/Documents/clippings")) == 1 then
		vim.health.ok("~/Documents/clippings")
	else
		vim.health.info("~/Documents/clippings will be auto-created on first use")
	end
end

return M
