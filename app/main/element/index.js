import { func } from "./func/index.js";
import { create } from "./create/index.js";
export let element = {
    func,
    create
}

import { shortcut } from "../index.js";
shortcut.addCSSToDoc('/app/main/element/element.css');