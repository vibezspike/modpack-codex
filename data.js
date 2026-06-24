// All data describing the recipe changes made throughout modpack development.
// Edit this file directly to add new recipes later — no need to touch app.js or index.html.

const CODEX = {
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
              output: "Granite ×8",
              id: "kubejs:granite",
              size: 3,
              grid: ["CCC","C#C","CCC"],
              key: { "C": "Cobblestone", "#": "Coal" },
              note: "8 cobblestone surrounding a coal in the center. Yields 8 granite per craft."
            },
            {
              type: "shaped",
              output: "Diorite ×4",
              id: "kubejs:diorite",
              size: 2,
              grid: ["C#","#C"],
              key: { "C": "Cobblestone", "#": "White Dye" },
              note: "Checkered 2×2 pattern of cobblestone and white dye."
            },
            {
              type: "shaped",
              output: "Tuff ×4",
              id: "kubejs:tuff",
              size: 2,
              grid: ["D#","#D"],
              key: { "D": "Cobbled Deepslate", "#": "Cobblestone" },
              note: "Checkered 2×2 pattern of cobbled deepslate and cobblestone."
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
              key: { "L": "#minecraft:logs (any log)" },
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
              flowInput: "Poppy",
              flowOutputs: [
                { text: "Red Dye", qty: "×1", guaranteed: true },
                { text: "Green Dye", chance: "15%" }
              ],
              note: "Required installing CreateKubeJS for the createMilling recipe type to exist. Chance items use CreateItem.of(item, chance) — the old Item.of().withChance() syntax was removed in 1.21.",
              code: `event.remove({ id: 'create:milling/poppy' })

event.recipes.createMilling([
  'minecraft:red_dye',
  CreateItem.of('minecraft:green_dye', 0.15)
], 'minecraft:poppy')`
            },
            {
              type: "milling",
              output: "String ×4",
              id: "create:milling/[color]_wool (×16 colors)",
              flowInput: "Wool (any of 16 colors)",
              flowOutputs: [
                { text: "String", qty: "×4", guaranteed: true }
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
              flowInput: "Raw Iron",
              flowOutputs: [
                { text: "Iron Ingot", guaranteed: true },
                { text: "Iron Nugget", chance: "50%" },
                { text: "Gold Nugget", chance: "25%" }
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
              flowInput: "Gravel",
              flowOutputs: [
                { text: "Flint", guaranteed: true },
                { text: "Iron Nugget", chance: "25%" }
              ],
              note: "Same array-order rule as crushing/milling: guaranteed outputs first, chance outputs via CreateItem.of()."
            },
            {
              type: "splashing",
              output: "Raw Zinc ×4 (guaranteed) + Zinc Nugget (chance)",
              id: "create:splashing/crushed_raw_zinc",
              flowInput: "Crushed Raw Zinc",
              flowOutputs: [
                { text: "Raw Zinc", qty: "×4", guaranteed: true },
                { text: "Zinc Nugget", chance: "25%" }
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
              type: "shapeless",
              output: "Special Stick",
              id: "kubejs:special_stick",
              flowInput: "2× Stick",
              flowOutputs: [{ text: "Special Stick", guaranteed: true }],
              note: "Plain custom item with no functional use beyond being a crafting ingredient for other mods/configs. Registered in startup_scripts (item registration must happen at startup, not in server_scripts). Needs a 16×16 PNG at kubejs/assets/kubejs/textures/item/special_stick.png or it renders as the missing-texture checkerboard.",
              code: `// startup_scripts
StartupEvents.registry('item', event => {
  event.create('special_stick')
    .displayName('Special Stick')
    .maxStackSize(64)
})

// server_scripts
ServerEvents.recipes(event => {
  event.shapeless('kubejs:special_stick', [
    'minecraft:stick',
    'minecraft:stick'
  ])
})`
            },
            {
              type: "shaped",
              output: "Litematica Stick",
              id: "kubejs:litematica_stick",
              size: 3,
              grid: [" P "," P "," P "],
              key: { "P": "#minecraft:planks" },
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
              key: { "I": "Iron Ingot", "D": "#storagedrawers:drawers (any drawer)", "C": "Chest" },
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
              key: { "A": "Upgrade Base", "B": "Copper Ingot", "C": "Copper Block" },
              note: "Cheapened starting tier — copper instead of the original (more expensive) materials."
            },
            {
              type: "shaped",
              output: "Stack Upgrade: Tier 1 (from Starter)",
              id: "sophisticatedbackpacks:stack_upgrade_tier_1_from_starter",
              size: 3,
              grid: ["BBB","BAB","BBB"],
              key: { "A": "Stack Upgrade: Starter Tier", "B": "Iron Ingot" },
              note: "This is an alternate recipe — same output item as the direct tier 1 recipe below, just a different crafting path (upgrading from starter tier instead of crafting from scratch). Both recipes can coexist."
            },
            {
              type: "shaped",
              output: "Stack Upgrade: Tier 1",
              id: "sophisticatedbackpacks:stack_upgrade_tier_1",
              size: 3,
              grid: ["BCB","CAC","BCB"],
              key: { "A": "Upgrade Base", "B": "Iron Ingot", "C": "Iron Block" },
              note: "Direct tier 1 craft. Pattern continues for tiers 2–4 (apply same structure, scale up materials per tier)."
            }
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
