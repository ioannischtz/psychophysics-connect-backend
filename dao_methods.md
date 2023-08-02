- [ ] Exists(field: Types.ObjectId | string): Promise<boolean>
- [ ] findPrivateById(id: Types.ObjectId): Promise<Model | null>
- [ ] findPrivateByIdLean(id: Types.ObjectId): Promise<Model | null>
- [ ] findPublicById(id: Types.ObjectId): Promise<Model | null>
- [ ] findPublicByIdLean(id: Types.ObjectId): Promise<Model | null>
- [ ] findFieldsById(id: Types.ObjectId, ...fields: (keyof
      Partial<ModelType>)[]): Promise<Model | null>
- [ ] findFieldsByIdLean(id: Types.ObjectId, ...fields: (keyof
      Partial<ModelType>)[]): Promise<Model | null>
- [ ] create(model: Model): Promise<Model>
- [ ] update(moedl: Model): Promise<Model>
- [ ] deleteById(id: Types.ObjectId): Promise<boolean>
- [ ] findManyByQuery(query: QueryOptions): Promise<Model[]>
- [ ] findManyByQueryLean(query: QueryOptions): Promise<Model[]>
