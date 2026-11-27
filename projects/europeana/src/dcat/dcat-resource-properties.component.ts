import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { JsonValue } from '@angular-devkit/core';
import { JsonObjectTableComponent } from '@eclipse-edc/dashboard-core';
import { Subscription } from 'rxjs';
import { DCAT_FIELDS, DcatField, dcatFormFields, dcatOwnedKeys } from './dcat-resource-fields';

/** UI layout for the same pluggable component. */
export type DcatPropertiesLayout = 'fields' | 'properties';

/**
 * Pluggable DCAT properties editor (asset Resource + dataAddress Distributions).
 *
 * - `layout="fields"` — Common Fields style (labeled inputs)
 * - `layout="properties"` — Properties style (table + key/value add)
 *
 * Pass `[fieldKeys]="['title','description']"` to pick from the shared catalog,
 * or `[fields]` for a full field list. Optional {@link DcatField.placeholder} only when set.
 * Free-form keys are not strictly validated.
 */
@Component({
  selector: 'europeana-dcat-resource-properties',
  standalone: true,
  imports: [ReactiveFormsModule, JsonObjectTableComponent],
  templateUrl: './dcat-resource-properties.component.html',
})
export class EuropeanaDcatResourcePropertiesComponent implements OnInit, OnChanges, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private fieldsFormSub?: Subscription;

  @Input() properties: Record<string, JsonValue> = {};
  /** `fields` = Common Fields look; `properties` = normal Properties look. */
  @Input() layout: DcatPropertiesLayout = 'properties';
  @Input() title = 'DCAT Resource';
  /** Optional help text under the title (e.g. key naming examples). */
  @Input() hint = '';
  /**
   * Optional prefix applied to free-form keys (Distributions only).
   * e.g. `distribution.` so typing `1.title` stores `distribution.1.title`.
   * Already-prefixed keys are left unchanged.
   */
  @Input() keyPrefix = '';
  /**
   * Keys to resolve via {@link dcatFormFields} (asset vs policy subsets).
   * When set, overrides {@link fields}.
   */
  @Input() fieldKeys?: readonly string[];
  @Input() fields: readonly DcatField[] = DCAT_FIELDS;
  @Output() propertiesChange = new EventEmitter<Record<string, JsonValue>>();

  fieldsForm!: FormGroup;

  addForm = new FormGroup({
    key: new FormControl('', Validators.required),
    value: new FormControl('', Validators.required),
  });

  activeFields: readonly DcatField[] = DCAT_FIELDS;

  private syncFieldCatalog(): void {
    this.activeFields = this.fieldKeys?.length ? dcatFormFields(...this.fieldKeys) : this.fields;
  }

  /** Whether the current properties map has any entries. */
  get hasProperties(): boolean {
    return Object.keys(this.properties ?? {}).length > 0;
  }

  /** True when the add-form key already exists in properties (case-insensitive). */
  get duplicateKey(): boolean {
    const key = this.addForm.value.key?.trim();
    return !!key && this.hasKey(this.applyKeyPrefix(key));
  }

  /** Placeholder for the free-form key input when a prefix is configured. */
  get keyPlaceholder(): string {
    return this.keyPrefix ? '1.title' : 'Key';
  }

  /** Placeholder for the free-form value input; uses the field catalog when the key matches. */
  get valuePlaceholder(): string {
    const raw = this.addForm.value.key?.trim();
    if (!raw) {
      return 'Value';
    }
    const field = this.findField(raw);
    return field?.placeholder?.trim() || 'Value';
  }

  /** Builds the fields form and emits property updates when layout is `fields`. */
  ngOnInit(): void {
    this.syncFieldCatalog();
    this.buildFieldsForm();
  }

  /** Reloads labeled inputs when properties / field catalog inputs change. */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fieldKeys'] || changes['fields']) {
      this.syncFieldCatalog();
      if (this.fieldsForm) {
        this.buildFieldsForm();
      }
      return;
    }
    if (changes['properties'] && this.fieldsForm && !changes['properties'].firstChange) {
      this.loadFieldsForm(this.properties);
    }
  }

  /** Tears down valueChanges subscription. */
  ngOnDestroy(): void {
    this.fieldsFormSub?.unsubscribe();
  }

  /** Returns a field's optional placeholder, or empty string. */
  fieldPlaceholder(field: DcatField): string {
    return field.placeholder?.trim() || '';
  }

  /** Adds a free-form key/value pair and clears the add form. */
  addProperty(): void {
    if (!this.addForm.valid || this.duplicateKey) {
      return;
    }
    const key = this.applyKeyPrefix(this.addForm.value.key!.trim());
    const value = this.parseValue(this.addForm.value.value!);
    this.propertiesChange.emit({ ...this.properties, [key]: value });
    this.addForm.reset();
  }

  /** Removes one property by key and emits the updated map. */
  deleteProperty(key: string): void {
    const { [key]: _, ...rest } = this.properties ?? {};
    this.propertiesChange.emit(rest);
  }

  /**
   * Prepends {@link keyPrefix} when set and the key does not already start with it.
   * No-op for the asset-level fields layout (prefix left empty).
   */
  private applyKeyPrefix(key: string): string {
    const prefix = this.keyPrefix?.trim();
    if (!prefix) {
      return key;
    }
    if (key.toLowerCase().startsWith(prefix.toLowerCase())) {
      return key;
    }
    return `${prefix}${key}`;
  }

  /** Creates / rebuilds the reactive form from {@link activeFields}. */
  private buildFieldsForm(): void {
    this.fieldsFormSub?.unsubscribe();
    this.fieldsForm = this.fb.group(Object.fromEntries(this.activeFields.map(f => [f.key, ['']])));
    this.loadFieldsForm(this.properties);
    this.fieldsFormSub = this.fieldsForm.valueChanges.subscribe(() => {
      if (this.layout === 'fields') {
        this.propertiesChange.emit(this.fieldsToProperties());
      }
    });
  }

  /**
   * Merges labeled field values into the properties map.
   * Preserves non-owned keys and reuses existing alias keys when present.
   */
  private fieldsToProperties(): Record<string, JsonValue> {
    const owned = new Set(dcatOwnedKeys(this.activeFields).map(k => k.toLowerCase()));
    const rest = Object.fromEntries(
      Object.entries(this.properties ?? {}).filter(([k]) => !owned.has(k.toLowerCase())),
    );

    for (const field of this.activeFields) {
      const raw = this.fieldsForm.get(field.key)?.value;
      if (typeof raw !== 'string' || !raw.trim()) {
        continue;
      }
      const writeKey = this.findPropertyEntry(this.properties ?? {}, field)?.key ?? field.key;
      rest[writeKey] = field.type === 'tags' ? this.parseTags(raw) : raw.trim();
    }
    return rest;
  }

  /** Patches the fields form from a properties map without emitting valueChanges. */
  private loadFieldsForm(properties: Record<string, JsonValue> | undefined): void {
    if (!this.fieldsForm) {
      return;
    }
    const source = properties ?? {};
    const patch: Record<string, string> = {};
    for (const field of this.activeFields) {
      const match = this.findPropertyEntry(source, field);
      patch[field.key] = match ? this.toInputString(match.value, field) : '';
    }
    this.fieldsForm.patchValue(patch, { emitEvent: false });
  }

  /**
   * Finds a property entry for a catalog field by key or alias (case-insensitive).
   * Returns the actual source key so writes can preserve the original spelling.
   */
  private findPropertyEntry(
    source: Record<string, JsonValue>,
    field: DcatField,
  ): { key: string; value: JsonValue } | undefined {
    for (const key of [field.key, ...(field.aliases ?? [])]) {
      const direct = source[key];
      if (direct !== undefined && direct !== null && direct !== '') {
        return { key, value: direct };
      }
      const found = Object.entries(source).find(([k]) => k.toLowerCase() === key.toLowerCase());
      if (found && found[1] !== undefined && found[1] !== null && found[1] !== '') {
        return { key: found[0], value: found[1] };
      }
    }
    return undefined;
  }

  /** Resolves a free-form key name to a catalog field via key or aliases. */
  private findField(name: string): DcatField | undefined {
    const lower = name.toLowerCase();
    return this.activeFields.find(
      f => f.key.toLowerCase() === lower || f.aliases?.some(a => a.toLowerCase() === lower),
    );
  }

  /** Case-insensitive check that a key already exists in properties. */
  private hasKey(key: string): boolean {
    const lower = key.toLowerCase();
    return Object.keys(this.properties ?? {}).some(k => k.toLowerCase() === lower);
  }

  /** Converts a stored JsonValue into a string for a labeled input. */
  private toInputString(value: JsonValue, field: DcatField): string {
    if (field.type === 'tags' && Array.isArray(value)) {
      return value.map(String).join(', ');
    }
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    return '';
  }

  /** Parses a comma-separated tags string into a single string or string array. */
  private parseTags(value: string): JsonValue {
    const tags = value
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
    return tags.length <= 1 ? (tags[0] ?? value.trim()) : tags;
  }

  /** Coerces free-form input into boolean, number, JSON, or plain string. */
  private parseValue(input: string): JsonValue {
    if (input === 'true' || input === 'false') {
      return input === 'true';
    }
    if (!isNaN(Number(input)) && input.trim() !== '') {
      return Number(input);
    }
    try {
      return JSON.parse(input);
    } catch {
      return input;
    }
  }
}
