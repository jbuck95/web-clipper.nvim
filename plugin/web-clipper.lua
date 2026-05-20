if vim.g.loaded_web_clipper then return end
vim.g.loaded_web_clipper = true

vim.api.nvim_create_user_command("WebClipper", function(info)
  local sub = info.args
  if sub == "clip" then
    require("web-clipper").clip()
  elseif sub == "clip_site" then
    require("web-clipper").clip_site()
  else
    vim.notify("Usage: WebClipper clip|clip_site", vim.log.levels.INFO)
  end
end, {
  nargs = 1,
  complete = function()
    return { "clip", "clip_site" }
  end,
})

vim.keymap.set({ "n", "v" }, "<Plug>(WebClipperClip)", function()
  require("web-clipper").clip()
end, { noremap = true, silent = true })

vim.keymap.set("n", "<Plug>(WebClipperClipSite)", function()
  require("web-clipper").clip_site()
end, { noremap = true, silent = true })
