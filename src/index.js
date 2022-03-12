const [editorUtil, formValidations] = await Promise.all([
    require("guilded/reguilded-util/editor"),
    require("guilded/components/formValidations")

]);

if (!editorUtil) console.warn("SEmbeds cannot function without given permission.");

// In-case Guilded changes something
const validations =
    typeof formValidations === "object" && typeof formValidations.default === "function" ? formValidations.default : {};

const embedModal = {
    header: "Roll dices",
    confirmText: "Roll !",
    shouldIgnoreUnsavedChanges: true,
    formSpecs: {
        sectionStyle: "border-unpadded",
        sections: [
            {
                fieldSpecs: [
                    {
                        type: "Text",
                        fieldName: "dices_number",
                        label: "Number of dices",
                        isOptional: false,
                        placeholder: "1",
                        validationFunction(value){
                            if (!parseInt(value) || parseInt(value)<=0){
                                return "Please enter a valid number";
                            }
                        }
                    },
                    {
                        type: "Text",
                        fieldName: "dices_type",
                        label: "Dice type",
                        isOptional: false,
                        placeholder: "10",
                        validationFunction(value){
                            if (!parseInt(value) || parseInt(value)<=0){
                                return "Please enter a valid number";
                            }
                        }
                    }
                ]
            }
            
        ]
    }
};

async function onRollClick({ editor, overlayProvider }) {
    const { confirmed, changedValues, isValid, hasChanged } = await overlayProvider.SimpleFormOverlay.Open(embedModal);
    // You can still get around it by setting colour
    if (confirmed && isValid && hasChanged) {
        const {
            dices_type,
            dices_number
        } = changedValues;

        var diceRollingString = "";
        const numbers = parseInt(dices_number);
        const type = parseInt(dices_type);
        var result = 0;
        for (var i = 0; i < numbers; i++) {
            const thisResult = Math.floor(Math.random() * type + 1);
            result += thisResult;
            diceRollingString+=(parseInt(i)+1)+": "+thisResult+"\n";
        }
        // Because field values are weird
        const embed = {
            title:"Dice rolling",
            description:"You rolled " + dices_number + " " + dices_type + " dices\n\n" + diceRollingString + "\n\nTotal: " + result,
            color: "#f5c400",
        };

        // Insert it where the caret is at
        editor.insertBlock({
            object: "block",
            type: "webhookMessage",
            data: {
                // TODO: Send multiple embeds
                embeds: [embed]
            },
            nodes: []
        });
        editor
    }
}
module.exports = {
    insertPluginAction: {
        name: "Dices",
        actions: [
            {
                action: "blockInsert",
                label: "Dices",
                bodyText: "Role some dices!",
                icon: "icon-description",
                sectionType: "rows",
                onAction: onRollClick
            }
        ]
    },
    // ReGuilded
    init() {},
    load() {
        const embedPlugin = editorUtil.getPluginByType("webhookMessage");
        
        embedPlugin.toolbarInfo = {
            iconGroup: "dices",
            iconName: "icon-description",
            tooltip: "Roll dices",
            onClick: onRollClick,
            menu: {
                size: "lg",
                menuSpecs: { id: "dicerolling", sections: [this.insertPluginAction] }
            }
        };
        this.insertedIndex = editorUtil.addInsertPlugin(embedPlugin);
        // Add it to whatever chat it has opened
        editorUtil.addSlateSection(this.insertPluginAction);
    },
    unload() {
        if (typeof this.insertedIndex === "number") editorUtil.removeInsertPlugin(this.insertedIndex);
        editorUtil.removeSlateSection(this.insertPluginAction.name);
    }
};