import * as Adaptive from "adaptivecards";
import * as Designer from "../../adaptivecards-designer";

var outlookConfiguration = require("../../../../../../samples/HostConfig/outlook-desktop.json");

export class OutlookContainer extends Designer.HostContainer {
    public renderTo(hostElement: HTMLElement) {
        hostElement.classList.add("outlook-frame");
        hostElement.appendChild(this.cardHost);
    }

    public initialize() {
        super.initialize();

        Adaptive.AdaptiveCard.actionTypeRegistry.unregisterType("Action.Submit");
        Adaptive.AdaptiveCard.actionTypeRegistry.registerType("Action.Http", () => { return new Adaptive.HttpAction(); });

        Adaptive.AdaptiveCard.useMarkdownInRadioButtonAndCheckbox = false;
    }

    private parsePadding(json: any): Adaptive.PaddingDefinition {
        if (json) {
            if (typeof json === "string") {
                let uniformPadding = Adaptive.getEnumValue(Adaptive.Spacing, json, Adaptive.Spacing.None);

                return new Adaptive.PaddingDefinition(
                    uniformPadding,
                    uniformPadding,
                    uniformPadding,
                    uniformPadding);
            }
            else if (typeof json === "object") {
                return new Adaptive.PaddingDefinition(
                    Adaptive.getEnumValue(Adaptive.Spacing, json["top"], Adaptive.Spacing.None),
                    Adaptive.getEnumValue(Adaptive.Spacing, json["right"], Adaptive.Spacing.None),
                    Adaptive.getEnumValue(Adaptive.Spacing, json["bottom"], Adaptive.Spacing.None),
                    Adaptive.getEnumValue(Adaptive.Spacing, json["left"], Adaptive.Spacing.None));
            }
        }

        return null;
    }

    public parseElement(element: Adaptive.CardElement, json: any) {
        if (element instanceof Adaptive.AdaptiveCard) {
            let card = <Adaptive.AdaptiveCard>element;
            let actionArray: Array<Adaptive.Action> = [];

            card["resources"] = { actions: actionArray };

            if (typeof json["resources"] === "object") {
                let actionResources = json["resources"]["actions"] as Array<any>;

                for (let i = 0; i < actionResources.length; i++) {
                    let action = Adaptive.AdaptiveCard.actionTypeRegistry.createInstance(actionResources[i]["type"]);

                    if (action) {
                        action.parse(actionResources[i]);
                        action.setParent(card);

                        actionArray.push(action);
                    }
                }
            }
        }

        if (element instanceof Adaptive.Image) {
            (<Adaptive.Image>element).backgroundColor = json["backgroundColor"];
        }

        if (element instanceof Adaptive.Container) {
            let padding = this.parsePadding(json["padding"]);

            if (padding) {
                (<Adaptive.Container>element).padding = padding;
            }
        }

        if (element instanceof Adaptive.ColumnSet) {
            let padding = this.parsePadding(json["padding"]);

            if (padding) {
                (<Adaptive.ColumnSet>element).padding = padding;
            }
        }
    }

    public anchorClicked(element: Adaptive.CardElement, anchor: HTMLAnchorElement): boolean {
        let regEx = /^action:([a-z0-9]+)$/ig;
        let rootCard = element.getRootElement() as Adaptive.AdaptiveCard;
        let matches = regEx.exec(anchor.href);

        if (matches) {
            let actionId = matches[1];

            if (rootCard) {
                let actionArray = rootCard["resources"]["actions"] as Array<Adaptive.Action>;

                for (let i = 0; i < actionArray.length; i++) {
                    if (actionArray[i].id === actionId) {
                        actionArray[i].execute();

                        return true;
                    }
                }
            }
        }

        return false;
    }

    public getHostConfig(): Adaptive.HostConfig {
        return new Adaptive.HostConfig(outlookConfiguration);
    }
}
