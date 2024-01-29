/** @odoo-module **/

/**
 * Copyright 2023 ACSONE SA/NV
 */

import {registry} from "@web/core/registry";
import {_lt} from "@web/core/l10n/translation";
import {DomainSelectorFieldInputForActiveIds} from "../domain_selector_field_input_for_active_ids/domain_selector_field_input_for_active_ids.esm";
import {onDidChange} from "../domain_selector_operators.esm";

const dso = registry.category("domain_selector/operator");

import {Component, useRef} from "@odoo/owl";

const parsers = registry.category("parsers");

class DomainSelectorFieldInput extends Component {
    parseValue(value) {
        const parser = parsers.get(this.props.field.type, (value) => value);
        try {
            return parser(value);
        } catch (_) {
            return value;
        }
    }

    onChange(ev) {
        this.props.update({ value: this.parseValue(ev.target.value) });
    }
}
DomainSelectorFieldInput.template = "base_geoengine.DomainSelectorFieldInput";

class DomainSelectorFieldInputWithTags extends Component {
    setup() {
        this.inputRef = useRef("input");
    }

    removeTag(tagIndex) {
        const value = [...this.props.value];
        value.splice(tagIndex, 1);
        this.props.update({ value });
    }
    addTag(value) {
        this.props.update({ value: this.props.value.concat(value) });
    }

    onBtnClick() {
        const value = this.inputRef.el.value;
        this.inputRef.el.value = "";
        this.addTag(value);
    }
}
DomainSelectorFieldInputWithTags.template = "base_geoengine.DomainSelectorFieldInputWithTags";

/**
 * This method is extended from DomainSelectorNumberField to add some operators
 * ("in active_ids", "not in active_ids", "in", "not in").
 */
export class DomainSelectorNumberFieldExtend extends Component {}
Object.assign(DomainSelectorNumberFieldExtend, {
    template: "base_geoengine.DomainSelectorNumberFieldExtend",
    components: {
        DomainSelectorFieldInput,
        DomainSelectorFieldInputWithTags,
        DomainSelectorFieldInputForActiveIds,
    },

    onDidTypeChange() {
        return {value: 0};
    },
    getOperators() {
        const addOperators = [
            {
                category: "active_ids",
                label: _lt("in active_ids"),
                value: "in active_ids",
                onDidChange: onDidChange((fieldChange) => fieldChange()),
                matches({operator}) {
                    return operator === this.value;
                },
            },
            {
                category: "active_ids",
                label: _lt("not in active_ids"),
                value: "not in active_ids",
                onDidChange: onDidChange((fieldChange) => fieldChange()),
                matches({operator}) {
                    return operator === this.value;
                },
            },
        ];
        const operators = [
            "=",
            "!=",
            ">",
            "<",
            ">=",
            "<=",
            "ilike",
            "not ilike",
            "in",
            "not in",
            "set",
            "not set",
        ].map((key) => dso.get(key));
        return operators.concat(addOperators);
    },
});
registry
    .category("domain_selector/fields")
    .add("integer", DomainSelectorNumberFieldExtend, {force: true});
