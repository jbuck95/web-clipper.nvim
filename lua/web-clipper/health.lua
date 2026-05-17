local M = {}

function M.check()
	vim.health.start("web-clipper")

	if vim.fn.executable("node") == 1 then
		vim.health.ok("node")
	else
		vim.health.error("node not found (required for defuddle-clip)")
	end

	if vim.fn.filereadable(vim.fn.expand("~/bin/defuddle-clip.mjs")) == 1 then
		vim.health.ok("~/bin/defuddle-clip.mjs")
	else
		vim.health.error("~/bin/defuddle-clip.mjs not found (core clipper script)")
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
		vim.health.warn("no clipboard tool found – URL input falls back to manual prompt")
	end

	if vim.fn.isdirectory(vim.fn.expand("~/Documents/clippings")) == 1 then
		vim.health.ok("~/Documents/clippings")
	else
		vim.health.info("~/Documents/clippings will be auto-created on first use")
	end
end

return M
