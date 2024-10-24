export const colorPaletteValues: { [key: number]: string } = {
    1: "#FF0000", // Red
    2: "#FFFF00", // Yellow
    3: "#00FF00", // Green
    4: "#00FFFF", // Cyan
    5: "#0000FF", // Blue
    6: "#FF00FF", // Magenta
    7: "#FFFFFF", // White
    8: "#808080", // Gray
    9: "#C0C0C0", // Light Gray
    10: "#FF0000", // Red (same as 1)
    11: "#FFFF00", // Yellow (same as 2)
    12: "#00FF00", // Green (same as 3)
    13: "#00FFFF", // Cyan (same as 4)
    14: "#0000FF", // Blue (same as 5)
    15: "#FF00FF", // Magenta (same as 6)
    16: "#FF0000", // Dark Red
    17: "#FFAAAA", // Light Red
    18: "#FFFFAA", // Light Yellow
    19: "#AAFFAA", // Light Green
    20: "#AAFFFF", // Light Cyan
    21: "#AAAFFF", // Light Blue
    22: "#FFAAFF", // Light Magenta
    23: "#AAAAAA", // Light Gray
    24: "#545454", // Dark Gray
    25: "#A5A5A5", // Silver
    26: "#FF5555", // Light Red
    27: "#FFFF55", // Light Yellow
    28: "#55FF55", // Light Green
    29: "#55FFFF", // Light Cyan
    30: "#5555FF", // Light Blue
    31: "#FF55FF", // Light Magenta
    32: "#FF5555", // Light Red (Duplicate)
    33: "#FFFF55", // Light Yellow (Duplicate)
    34: "#55FF55", // Light Green (Duplicate)
    35: "#55FFFF", // Light Cyan (Duplicate)
    36: "#5555FF", // Light Blue (Duplicate)
    37: "#FF55FF", // Light Magenta (Duplicate)
    38: "#AA0000", // Dark Red
    39: "#AA5500", // Dark Orange
    40: "#AAFF00", // Yellow Green
    41: "#00AA00", // Dark Green
    42: "#00AA55", // Dark Cyan
    43: "#00AAFF", // Sky Blue
    44: "#0000AA", // Dark Blue
    45: "#5500AA", // Dark Purple
    46: "#AA00AA", // Dark Magenta 
    47: "#FF0055", // Reddish Pink
    48: "#FFAA55", // Orange
    49: "#FFFF55", // Light Yellow
    50: "#AAFF55", // Yellow Green
    51: "#55FF55", // Light Green
    52: "#55FFAA", // Light Cyan
    53: "#55FFFF", // Light Blue Cyan
    54: "#55AAFF", // Light Sky Blue
    55: "#5555FF", // Light Blue
    56: "#AA55FF", // Light Purple
    57: "#FF55FF", // Light Magenta
    58: "#FF55AA", // Pink Magenta
    59: "#FF5555", // Light Red
    60: "#FFAA55", // Light Orange
    61: "#FFFFAA", // Pale Yellow
    62: "#AAFFAA", // Pale Green
    63: "#AAFFFF", // Pale Cyan
    64: "#AAD4FF", // Pale Blue
    65: "#AAAAFF", // Soft Blue
    66: "#FFAAAA", // Soft Red
    67: "#FFAAFF", // Soft Pink
    68: "#FFD4FF", // Soft Magenta
    69: "#FFC0C0", // Soft Red Tone
    70: "#FFFFC0", // Soft Yellow Tone
    71: "#C0FFC0", // Soft Green Tone
    72: "#C0FFFF", // Soft Cyan Tone
    73: "#C0D4FF", // Soft Sky Blue
    74: "#C0C0FF", // Soft Blue Tone
    75: "#D4C0FF", // Soft Purple Tone
    76: "#FFC0D4", // Soft Magenta Pink
    77: "#FFC0AA", // Pale Orange
    78: "#FFFFAA", // Pale Yellow
    79: "#AAFFAA", // Pale Green
    80: "#AAFFFF", // Pale Cyan
    81: "#AAD4FF", // Pale Sky Blue
    82: "#AAAAFF", // Pale Blue
    83: "#FFD4AA", // Pale Soft Orange
    84: "#FFC0AA", // Light Orange
    85: "#FFD4C0", // Soft Red Orange
    86: "#FFFFC0", // Soft Yellow Orange
    87: "#D4FFAA", // Light Yellow Green
    88: "#C0FFAA", // Soft Green Yellow
    89: "#D4FFFF", // Pale Cyan Green
    90: "#C0FFFF", // Soft Cyan Blue
    91: "#D4AAFF", // Pale Purple Pink
    92: "#FFD4FF", // Light Soft Pink
    93: "#FFC0FF", // Soft Pink Magenta
    94: "#FFC0D4", // Light Pink
    95: "#FFC0C0", // Pale Red Tone
    96: "#FFAAAA", // Soft Red
    97: "#FFD4AA", // Soft Orange
    98: "#FFFFAA", // Soft Yellow
    99: "#D4FFAA", // Soft Yellow Green
    100: "#AAFFAA", // Soft Green
    101: "#AAFFD4", // Soft Green Cyan
    102: "#AAFFFF", // Soft Cyan
    103: "#AAD4FF", // Soft Sky Blue
    104: "#AAAAFF", // Soft Blue
    105: "#D4AAFF", // Soft Purple
    106: "#FFAAFF", // Soft Pink
    107: "#FFAAFF", // Light Pink
    108: "#FF55FF", // Bright Magenta
    109: "#FF55AA", // Bright Pink
    110: "#FF5555", // Bright Red
    111: "#FFAA55", // Bright Orange
    112: "#FFFF55", // Bright Yellow
    113: "#AAFF55", // Bright Yellow Green
    114: "#55FF55", // Bright Green
    115: "#55FFAA", // Bright Green Cyan
    116: "#55FFFF", // Bright Cyan
    117: "#55AAFF", // Bright Sky Blue
    118: "#5555FF", // Bright Blue
    119: "#AA55FF", // Bright Purple
    120: "#FF55FF", // Bright Pink
    121: "#FFAAFF", // Light Magenta
    122: "#FFAAAA", // Pale Red
    123: "#FF5555", // Bright Red
    124: "#FFD4AA", // Pale Orange
    125: "#FFFFAA", // Pale Yellow
    126: "#D4FFAA", // Light Yellow Green
    127: "#AAFFAA", // Light Green
    128: "#AAFFD4", // Light Green Cyan
    129: "#AAFFFF", // Light Cyan
    130: "#AAD4FF", // Light Sky Blue
    131: "#AAAAFF", // Light Blue
    132: "#D4AAFF", // Light Purple
    133: "#FFAAFF", // Light Pink
    134: "#FFAAAA", // Pale Red
    135: "#FFD4FF", // Pale Pink
    136: "#FFC0FF", // Light Pink
    137: "#FFC0C0", // Soft Red
    138: "#FFD4C0", // Soft Orange Red
    139: "#FFFFC0", // Soft Yellow Orange
    140: "#D4FFC0", // Pale Green Yellow
    141: "#C0FFC0", // Pale Green
    142: "#C0FFD4", // Pale Green Cyan
    143: "#C0FFFF", // Pale Cyan
    144: "#C0D4FF", // Pale Blue Cyan
    145: "#C0C0FF", // Pale Blue
    146: "#D4C0FF", // Pale Purple Blue
    147: "#FFC0FF", // Pale Pink Purple
    148: "#FFC0D4", // Pale Pink Red
    149: "#FFAAAA", // Light Red
    150: "#FF5555", // Bright Red
    151: "#FFD4AA", // Light Orange
    152: "#FFFFAA", // Light Yellow
    153: "#D4FFAA", // Light Yellow Green
    154: "#AAFFAA", // Light Green
    155: "#AAFFD4", // Light Cyan Green
    156: "#AAFFFF", // Light Cyan
    157: "#AAD4FF", // Light Blue Cyan
    158: "#AAAAFF", // Light Blue
    159: "#D4AAFF", // Light Purple Blue
    160: "#FFAAFF", // Light Pink Purple
    161: "#FFAAAA", // Light Red Pink
    162: "#FFD4FF", // Light Pink
    163: "#FFC0FF", // Light Magenta
    164: "#FFC0C0", // Pale Red
    165: "#FFD4C0", // Pale Orange Red
    166: "#FFFFC0", // Pale Yellow Orange
    167: "#D4FFC0", // Light Yellow Green
    168: "#C0FFC0", // Light Green
    169: "#C0FFD4", // Light Cyan Green
    170: "#C0FFFF", // Light Cyan
    171: "#C0D4FF", // Light Blue Cyan
    172: "#C0C0FF", // Light Blue
    173: "#D4C0FF", // Light Purple Blue
    174: "#FFC0FF", // Light Pink Purple
    175: "#FFC0D4", // Light Pink Red
    176: "#FFAAAA", // Light Red
    177: "#FF5555", // Bright Red
    178: "#FFD4AA", // Bright Orange
    179: "#FFFFAA", // Bright Yellow
    180: "#D4FFAA", // Bright Yellow Green
    181: "#AAFFAA", // Bright Green
    182: "#AAFFD4", // Bright Cyan Green
    183: "#AAFFFF", // Bright Cyan
    184: "#AAD4FF", // Bright Blue Cyan
    185: "#AAAAFF", // Bright Blue
    186: "#D4AAFF", // Bright Purple Blue
    187: "#FFAAFF", // Bright Pink Purple
    188: "#FFAAAA", // Bright Red Pink
    189: "#FFD4FF", // Bright Pink
    190: "#FFC0FF", // Bright Magenta
    191: "#FFC0C0", // Bright Pale Red
    192: "#FFD4C0", // Bright Pale Orange
    193: "#FFFFC0", // Bright Pale Yellow
    194: "#D4FFC0", // Bright Pale Yellow Green
    195: "#C0FFC0", // Bright Pale Green
    196: "#C0FFD4", // Bright Pale Cyan Green
    197: "#C0FFFF", // Bright Pale Cyan
    198: "#C0D4FF", // Bright Pale Blue Cyan
    199: "#C0C0FF", // Bright Pale Blue
    200: "#D4C0FF", // Bright Pale Purple Blue
    201: "#FFC0FF", // Bright Pale Pink Purple
    202: "#FFC0D4", // Bright Pale Pink Red
    203: "#FFAAAA", // Light Red
    204: "#FF5555", // Bright Red
    205: "#FFD4AA", // Light Orange
    206: "#FFFFAA", // Light Yellow
    207: "#D4FFAA", // Light Yellow Green
    208: "#AAFFAA", // Light Green
    209: "#AAFFD4", // Light Cyan Green
    210: "#AAFFFF", // Light Cyan
    211: "#AAD4FF", // Light Blue Cyan
    212: "#AAAAFF", // Light Blue
    213: "#D4AAFF", // Light Purple Blue
    214: "#FFAAFF", // Light Pink Purple
    215: "#FFAAAA", // Light Red Pink
    216: "#FFD4FF", // Light Pink
    217: "#FFC0FF", // Light Magenta
    218: "#FFC0C0", // Pale Red
    219: "#FFD4C0", // Pale Orange
    220: "#FFFFC0", // Pale Yellow
    221: "#D4FFC0", // Pale Yellow Green
    222: "#C0FFC0", // Pale Green
    223: "#C0FFD4", // Pale Green Cyan
    224: "#C0FFFF", // Pale Cyan
    225: "#C0D4FF", // Pale Blue Cyan
    226: "#C0C0FF", // Pale Blue
    227: "#D4C0FF", // Pale Purple Blue
    228: "#FFC0FF", // Pale Pink Purple
    229: "#FFC0D4", // Pale Pink Red
    230: "#FFAAAA", // Pale Red Pink
    231: "#FF5555", // Bright Red Pink
    232: "#FFD4AA", // Bright Orange Pink
    233: "#FFFFAA", // Bright Yellow Pink
    234: "#D4FFAA", // Bright Yellow Green Pink
    235: "#AAFFAA", // Bright Green Pink
    236: "#AAFFD4", // Bright Cyan Green Pink
    237: "#AAFFFF", // Bright Cyan Pink
    238: "#AAD4FF", // Bright Blue Cyan Pink
    239: "#AAAAFF", // Bright Blue Pink
    240: "#D4AAFF", // Bright Purple Pink
    241: "#FFAAFF", // Bright Pink Purple
    242: "#FFAAAA", // Bright Red Pink
    243: "#FFD4FF", // Bright Pink
    244: "#FFC0FF", // Bright Magenta Pink
    245: "#FFC0C0", // Pale Red Pink
    246: "#FFD4C0", // Pale Orange Pink
    247: "#FFFFC0", // Pale Yellow Pink
    248: "#D4FFC0", // Pale Yellow Green Pink
    249: "#C0FFC0", // Pale Green Pink
    250: "#C0FFD4", // Pale Green Cyan Pink
    251: "#C0FFFF", // Pale Cyan Pink
    252: "#C0D4FF", // Pale Blue Cyan Pink
    253: "#C0C0FF", // Pale Blue Pink
    254: "#D4C0FF", // Pale Purple Pink
    255: "#FFFFFF" // White
};