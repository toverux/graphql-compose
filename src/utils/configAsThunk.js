/* @flow strict */
/* eslint-disable no-param-reassign, no-use-before-define */

import { isFunction, isObject } from './is';
import type { SchemaComposer } from '../schemaComposer';

export type FieldMaps = {
  [fieldName: string]: any,
  __proto__: null,
};

export function resolveOutputConfigsAsThunk<T: FieldMaps>(
  schema: SchemaComposer<any>,
  fieldMap: T,
  typeName?: string = ''
): T {
  if (isObject(fieldMap)) {
    Object.keys(fieldMap).forEach(name => {
      if (isFunction(fieldMap[name])) {
        const fieldConfig: any = schema.typeMapper.convertOutputFieldConfig(
          fieldMap[name](),
          name,
          typeName
        );
        fieldConfig._fieldAsThunk = fieldMap[name];
        fieldMap[name] = fieldConfig;
      }

      if (isFunction(fieldMap[name].type)) {
        fieldMap[name]._typeAsThunk = fieldMap[name].type;
        const fieldConfig = schema.typeMapper.convertOutputFieldConfig(
          fieldMap[name].type(),
          name,
          typeName
        );
        fieldMap[name].type = fieldConfig.type;
      }

      if (isObject(fieldMap[name].args)) {
        fieldMap[name].args = resolveInputConfigsAsThunk(
          schema,
          fieldMap[name].args,
          `${typeName}.${name}.args`
        );
      }
    });
  }
  return fieldMap;
}

export function resolveInputConfigsAsThunk<T: FieldMaps>(
  schema: SchemaComposer<any>,
  fieldMap: T,
  typeName?: string
): T {
  if (isObject(fieldMap)) {
    Object.keys(fieldMap).forEach(name => {
      if (isFunction(fieldMap[name])) {
        const fieldConfig: any = schema.typeMapper.convertInputFieldConfig(
          fieldMap[name](),
          name,
          typeName
        );
        fieldConfig._fieldAsThunk = fieldMap[name];
        fieldMap[name] = fieldConfig;
      }

      if (isFunction(fieldMap[name].type)) {
        fieldMap[name]._typeAsThunk = fieldMap[name].type;
        const fieldConfig = schema.typeMapper.convertInputFieldConfig(
          fieldMap[name].type(),
          name,
          typeName
        );
        fieldMap[name].type = fieldConfig.type;
      }
    });
  }
  return fieldMap;
}

export function keepConfigsAsThunk<T: FieldMaps>(fieldMap: T): T {
  if (isObject(fieldMap)) {
    Object.keys(fieldMap).forEach(key => {
      if (fieldMap[key]._fieldAsThunk) {
        fieldMap[key] = fieldMap[key]._fieldAsThunk;
      } else {
        if (fieldMap[key]._typeAsThunk) {
          fieldMap[key].type = fieldMap[key]._typeAsThunk;
        }
        if (fieldMap[key].args) {
          fieldMap[key].args = keepConfigsAsThunk(fieldMap[key].args);
        }
      }
    });
  }
  return fieldMap;
}
