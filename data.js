// All data describing the recipe changes made throughout modpack development.
// Edit this file directly to add new recipes later — no need to touch app.js or index.html.
//
// ICONS: item/block images are pulled live from a public Minecraft asset mirror on jsDelivr.
// For vanilla items just set `icon` to the item's internal ID, e.g. "cobblestone", "white_dye".
// The site automatically tries /textures/item/<icon>.png then falls back to /textures/block/<icon>.png.
// For custom/modded items with no vanilla art (Create, Sophisticated Backpacks, your own KubeJS items),
// just omit `icon` (or leave it null) and the slot will show text instead — there's no public art source
// for those, so a manual screenshot is the only real option if you want an image for them.

const MC_ICON_VERSION = "1.21.1";
const MC_ICON_BASE = `https://cdn.jsdelivr.net/gh/InventivetalentDev/minecraft-assets@${MC_ICON_VERSION}/assets/minecraft/textures`;

function mcIconUrls(iconName){
  if (!iconName) return null;
  return [
    `${MC_ICON_BASE}/item/${iconName}.png`,
    `${MC_ICON_BASE}/block/${iconName}.png`
  ];
}

const CODEX = {
  // Simple running list — just add a string per idea. No need for icons, grids, or recipe IDs here,
  // this section is meant for quick notes on things you're planning but haven't built yet.
  upcomingChanges: [
    "upload screenshots of all non-vanilla recipes to the /icons folder for the site to pull from",
    "Hide the 16 duplicate wool milling recipes from JEI's recipe list (clutter cleanup)",
    "Apply the stack upgrade tier pattern to tiers 2, 3, and 4 for Sophisticated Backpacks",
    "Look into a config or workaround for Sable's magnet hose connector disconnecting on redstone power",
    "Add recipe for logs into sticks without turning logs->planks->sticks"
  ],
  sections: [
    {
      id: "stone",
      title: "Stone Recipes",
      eyebrow: "World Gen Blocks",
      subsections: [
        {
          title: null,
          recipes: [
            {
              type: "shaped",
              output: "Granite x8",
              id: "kubejs:granite",
              size: 3,
              grid: ["CCC","C#C","CCC"],
              key: {
                "C": { name: "Cobblestone", icon: "cobblestone" },
                "#": { name: "Coal", icon: "coal" }
              },
              note: "8 cobblestone surrounding a coal in the center. Yields 8 granite per craft."
            },
            {
              type: "shaped",
              output: "Diorite x4",
              id: "kubejs:diorite",
              size: 2,
              grid: ["C#","#C"],
              key: {
                "C": { name: "Cobblestone", icon: "cobblestone" },
                "#": { name: "White Dye", icon: "white_dye" }
              },
              note: "Checkered 2x2 pattern of cobblestone and white dye."
            },
            {
              type: "shaped",
              output: "Tuff x4",
              id: "kubejs:tuff",
              size: 2,
              grid: ["D#","#D"],
              key: {
                "D": { name: "Cobbled Deepslate", icon: "cobbled_deepslate" },
                "#": { name: "Cobblestone", icon: "cobblestone" }
              },
              note: "Checkered 2x2 pattern of cobbled deepslate and cobblestone."
            }
          ]
        }
      ]
    },
    {
      id: "wood",
      title: "Wooden Recipes",
      eyebrow: "Logs & Lumber",
      subsections: [
        {
          title: null,
          recipes: [
            {
              type: "shaped",
              output: "Chest",
              id: "minecraft:chest",
              size: 3,
              grid: ["LLL","L L","LLL"],
              key: { "L": { name: "any log", icon: "oak_log" } },
              note: "One-sweep chest recipe — accepts any log type via tag, mixed types allowed. Use #minecraft:logs_that_burn instead if you also want stripped logs / wood blocks to count."
            }
          ]
        }
      ]
    },
    {
      id: "create",
      title: "Create Recipes",
      eyebrow: "Milling · Crushing · Splashing",
      subsections: [
        {
          title: "Milling",
          recipes: [
            {
              type: "milling",
              output: "Red Dye (guaranteed) + Green Dye (chance)",
              id: "create:milling/poppy",
              flowInput: { text: "Poppy", icon: "poppy" },
              flowOutputs: [
                { text: "Red Dye", qty: "x1", guaranteed: true, icon: "red_dye" },
                { text: "Green Dye", chance: "15%", icon: "green_dye" }
              ],
              note: "Changed the odds of getting green dye from poppies to 15% instead of the default.",
              code: `event.remove({ id: 'create:milling/poppy' })

event.recipes.createMilling([
  'minecraft:red_dye',
  CreateItem.of('minecraft:green_dye', 0.15)
], 'minecraft:poppy')`
            },
            {
              type: "milling",
              output: "String x4",
              id: "create:milling/[color]_wool (x16 colors)",
              flowInput: { text: "Wool (any of 16 colors)", icon: "white_wool" },
              flowOutputs: [
                { text: "String", qty: "x4", guaranteed: true, icon: "string" }
              ],
              note: "Tags aren't accepted as milling input, so this is looped across all 16 wool color IDs individually. This clutters JEI's recipe list — consider hiding the duplicate entries via a JEIEvents.hideRecipes client script if it gets annoying.",
              code: `[
  'minecraft:white_wool', 'minecraft:orange_wool', /* ...all 16 colors */
].forEach(wool => {
  event.remove({ output: 'minecraft:string', input: wool })
  event.recipes.createMilling(['4x minecraft:string'], wool)
})`
            }
          ]
        },
        {
          title: "Crushing",
          recipes: [
            {
              type: "crushing",
              output: "Iron Ingot (guaranteed) + Iron Nugget (chance) + Gold Nugget (chance)",
              id: "create:crushing/raw_iron",
              flowInput: { text: "Raw Iron", icon: "raw_iron" },
              flowOutputs: [
                { text: "Iron Ingot", guaranteed: true, icon: "iron_ingot" },
                { text: "Iron Nugget", chance: "50%", icon: "iron_nugget" },
                { text: "Gold Nugget", chance: "25%", icon: "gold_nugget" }
              ],
              note: "Pattern for stacking multiple chance outputs: guaranteed item(s) first in the array, then as many CreateItem.of(item, chance) entries as needed.",
              code: `event.remove({ id: 'create:crushing/raw_iron' })

event.recipes.createCrushing([
  'minecraft:iron_ingot',
  CreateItem.of('minecraft:iron_nugget', 0.5),
  CreateItem.of('minecraft:gold_nugget', 0.25)
], 'minecraft:raw_iron')`
            }
          ]
        },
        {
          title: "Splashing (Washing)",
          recipes: [
            {
              type: "splashing",
              output: "Iron Nugget (chance)",
              id: "create:splashing/gravel",
              flowInput: { text: "Gravel", icon: "gravel" },
              flowOutputs: [
                { text: "Flint", guaranteed: true, icon: "flint" },
                { text: "Iron Nugget", chance: "25%", icon: "iron_nugget" }
              ],
              note: "Same array-order rule as crushing/milling: guaranteed outputs first, chance outputs via CreateItem.of()."
            },
            {
              type: "splashing",
              output: "Raw Zinc x4 (guaranteed) + Zinc Nugget (chance)",
              id: "create:splashing/crushed_raw_zinc",
              flowInput: { text: "Crushed Raw Zinc", icon: null },
              flowOutputs: [
                { text: "Raw Zinc", qty: "x4", guaranteed: true, icon: null },
                { text: "Zinc Nugget", chance: "25%", icon: null }
              ],
              note: "Quantity prefix (e.g. '4x minecraft:raw_zinc') works the same in Create recipe arrays as it does in vanilla shaped/shapeless recipes."
            }
          ]
        }
      ]
    },
    {
      id: "custom-items",
      title: "Custom Items & Recipes",
      eyebrow: "KubeJS-Registered Items",
      subsections: [
        {
          title: null,
          recipes: [
            {
              type: "shaped",
              output: "Litematica Stick",
              id: "kubejs:litematica_stick",
              size: 3,
              grid: [
                " P ",
                " P ",
                " P "
              ],
              key: { "P": { name: "#minecraft:planks", icon: "oak_planks" } },
              note: "Used to fix a typo where event.shapeed (extra 'e') was used instead of event.shaped — that silent-fail/typo pattern is worth remembering since KubeJS won't always throw an obvious error for it.",
              configId: "kubejs:litematica_stick — use this exact string when referencing the item in a mod's config file (namespace:item_name)."
            }
          ]
        }
      ]
    },
    {
      id: "storage",
      title: "Storage Recipes",
      eyebrow: "Drawers & Backpacks",
      subsections: [
        {
          title: "Storage Drawers",
          recipes: [
            {
              type: "shaped",
              output: "Controller",
              id: "storagedrawers:controller",
              size: 3,
              grid: ["IDI","DCD","IDI"],
              key: {
                "I": { name: "Iron Ingot", icon: "iron_ingot" },
                "D": { name: "#storagedrawers:drawers (any drawer)", icon: null },
                "C": { name: "Chest", icon: "chest" }
              },
              note: "Demonstrates using a tag (#storagedrawers:drawers) as a recipe key — same # prefix syntax works for any tag, vanilla or modded."
            }
          ]
        },
        {
          title: "Sophisticated Backpacks",
          recipes: [
            {
              type: "shaped",
              output: "Stack Upgrade: Starter Tier",
              id: "sophisticatedbackpacks:stack_upgrade_starter_tier",
              size: 3,
              grid: ["BCB","CAC","BCB"],
              key: {
                "A": { name: "Upgrade Base", icon: null },
                "B": { name: "Copper Ingot", icon: "copper_ingot" },
                "C": { name: "Copper Block", icon: "copper_block" }
              },
              note: "Cheapened starting tier — copper instead of the original (more expensive) materials."
            },
            {
              type: "shaped",
              output: "Stack Upgrade: Tier 1 (from Starter)",
              id: "sophisticatedbackpacks:stack_upgrade_tier_1_from_starter",
              size: 3,
              grid: ["BBB","BAB","BBB"],
              key: {
                "A": { name: "Stack Upgrade: Starter Tier", icon: null },
                "B": { name: "Iron Ingot", icon: "iron_ingot" }
              },
              note: "This is an alternate recipe — same output item as the direct tier 1 recipe below, just a different crafting path (upgrading from starter tier instead of crafting from scratch). Both recipes can coexist."
            },
            {
              type: "shaped",
              output: "Stack Upgrade: Tier 1",
              id: "sophisticatedbackpacks:stack_upgrade_tier_1",
              size: 3,
              grid: ["BCB","CAC","BCB"],
              key: {
                "A": { name: "Upgrade Base", icon: null },
                "B": { name: "Iron Ingot", icon: "iron_ingot" },
                "C": { name: "Iron Block", icon: "iron_block" }
              },
              note: "Direct tier 1 craft. Pattern continues for tiers 2–4 (apply same structure, scale up materials per tier)."
            },
            {
              type: "shaped",
              output: "Stack Upgrade: Tier 2",
              id: "sophisticatedbackpacks:stack_upgrade_tier_2",
              size: 3,
              grid: [
                "BCB",
                "CAC",
                "BCB"
              ],
              key: {
                "A": { name: "Upgrade Base", icon: null },
                "B": { name: "Gold Ingot", icon: "gold_ingot" },
                "C": { name: "Gold Block", icon: "gold_block" }
              },
              note: "test"
            },
          ]
        }
      ]
    },
    {
      id: "block-breaking",
      title: "Block Breaking Changes",
      eyebrow: "BlockEvents.broken",
      subsections: [
        {
          title: null,
          recipes: [
            {
              type: "break",
              output: "Glass / Stained Glass / Panes — always drop",
              id: "BlockEvents.broken (33 block IDs)",
              icon: "glass",
              note: "Tags are NOT accepted in BlockEvents.broken — only direct block IDs. Looped across plain glass, glass panes, and all 16 stained glass + stained glass pane colors. Originally tried event.level.spawnItemEntity(), which isn't a real KubeJS method — the correct call is event.block.popItem(Item.of(blockId)).",
              code: `[
  'minecraft:glass',
  'minecraft:glass_pane',
  'minecraft:white_stained_glass',
  // ...all 16 stained glass colors
  'minecraft:white_stained_glass_pane',
  // ...all 16 stained glass pane colors
].forEach(block => {
  BlockEvents.broken(block, event => {
    event.block.popItem(Item.of(block))
  })
})`
            }
          ]
        }
      ]
    }
  ]
};
