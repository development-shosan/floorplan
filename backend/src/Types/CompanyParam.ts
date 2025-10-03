export type CompanyInfo = {
    id: number;
    name: string;
    nameKana: string | null;
    representative: string | null;
    email: string | null;
    status: boolean;
    postalCode: string | null;
    prefecture: string | null;
    city: string | null;
    streetAddress: string | null;
    createdAt: Date;
    createdById: number | null;
    updatedAt: Date;
    updatedById: number | null;
    members: number;
};

export type CompanyInfoOutput = {
    companies: CompanyInfo[];
};

export type CreateCompanyDataInput = Pick<
    CompanyInfo,
    | 'name'
    | 'nameKana'
    | 'representative'
    | 'email'
    | 'postalCode'
    | 'prefecture'
    | 'city'
    | 'streetAddress'
>;

export type UpdateCompanyDataInput = CreateCompanyDataInput & {
    status: boolean;
};
