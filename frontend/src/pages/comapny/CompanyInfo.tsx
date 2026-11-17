import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from 'react';

import { companyAPI } from '../../api/companyAPI';

import type {
  Company,
  CompanyFormData,
} from '../../types/companyTypes';

const initialForm: CompanyFormData = {
  company_name: '',
  trade_name: '',
  gstin: '',
  pan: '',
  email: '',
  phone: '',
  website: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  state_code: '',
  pincode: '',
  country: 'India',
  bank_name: '',
  bank_account_name: '',
  bank_account_number: '',
  bank_ifsc: '',
  authorised_signatory: '',
  invoice_footer: '',
};

const apiBaseUrl =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api/v1';

const serverOrigin = new URL(apiBaseUrl).origin;

const getLogoUrl = (logoPath: string) => {
  if (
    logoPath.startsWith('http://') ||
    logoPath.startsWith('https://')
  ) {
    return logoPath;
  }

  return new URL(
    logoPath.startsWith('/') ? logoPath : `/${logoPath}`,
    serverOrigin,
  ).toString();
};

const toFormValues = (company: Company): CompanyFormData => ({
  company_name: company.company_name || '',
  trade_name: company.trade_name || '',
  gstin: company.gstin || '',
  pan: company.pan || '',
  email: company.email || '',
  phone: company.phone || '',
  website: company.website || '',
  address_line1: company.address_line1 || '',
  address_line2: company.address_line2 || '',
  city: company.city || '',
  state: company.state || '',
  state_code: company.state_code || '',
  pincode: company.pincode || '',
  country: company.country || 'India',
  bank_name: company.bank_name || '',
  bank_account_name: company.bank_account_name || '',
  bank_account_number: company.bank_account_number || '',
  bank_ifsc: company.bank_ifsc || '',
  authorised_signatory: company.authorised_signatory || '',
  invoice_footer: company.invoice_footer || '',
});

type FieldErrors = Partial<Record<keyof CompanyFormData, string>>;

const validateCompany = (
  values: CompanyFormData,
): FieldErrors => {
  const errors: FieldErrors = {};

  const required = values.company_name.trim();

  if (!required) {
    errors.company_name = 'Company name is required.';
  } else if (required.length > 255) {
    errors.company_name = 'Maximum 255 characters allowed.';
  }

  const email = values.email.trim();

  if (
    email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    errors.email = 'Please enter a valid email address.';
  }

  const gstin = values.gstin.trim().toUpperCase();

  if (
    gstin &&
    !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(gstin)
  ) {
    errors.gstin = 'Please enter a valid GSTIN.';
  }

  const pan = values.pan.trim().toUpperCase();

  if (pan && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) {
    errors.pan = 'Please enter a valid PAN number.';
  }

  if (
    values.pincode.trim() &&
    !/^[0-9]{6}$/.test(values.pincode.trim())
  ) {
    errors.pincode = 'Pincode must contain exactly 6 digits.';
  }

  if (
    values.state_code.trim() &&
    !/^[0-9]{2}$/.test(values.state_code.trim())
  ) {
    errors.state_code = 'State code must contain 2 digits.';
  }

  const ifsc = values.bank_ifsc.trim().toUpperCase();

  if (
    ifsc &&
    !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)
  ) {
    errors.bank_ifsc = 'Please enter a valid IFSC code.';
  }

  const maxLengths: Partial<Record<keyof CompanyFormData, number>> = {
    company_name: 255,
    trade_name: 255,
    gstin: 15,
    pan: 10,
    email: 150,
    phone: 20,
    website: 255,
    address_line1: 255,
    address_line2: 255,
    city: 100,
    state: 100,
    state_code: 2,
    pincode: 10,
    country: 100,
    bank_name: 150,
    bank_account_name: 255,
    bank_account_number: 50,
    bank_ifsc: 11,
    authorised_signatory: 255,
  };

  Object.entries(maxLengths).forEach(([key, max]) => {
    const field = key as keyof CompanyFormData;

    if (values[field].length > max!) {
      errors[field] = `Maximum ${max} characters allowed.`;
    }
  });

  return errors;
};

interface InputFieldProps {
  label: string;
  name: keyof CompanyFormData;
  value: string;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  error?: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
}

const InputField = ({
  label,
  name,
  value,
  onChange,
  error,
  required,
  type = 'text',
  placeholder,
}: InputFieldProps) => (
  <div>
    <label
      htmlFor={name}
      className="mb-1 block text-sm font-medium text-gray-700"
    >
      {label}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>

    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder || `Enter ${label.toLowerCase()}`}
      maxLength={undefined}
      className={`w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 ${
        error
          ? 'border-red-500 focus:ring-red-100'
          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
      }`}
    />

    {error && (
      <p className="mt-1 text-xs text-red-600">{error}</p>
    )}
  </div>
);

interface FormSectionProps {
  title: string;
  children: ReactNode;
}

const FormSection = ({ title, children }: FormSectionProps) => (
  <section className="rounded-lg border border-gray-200 bg-white p-5">
    <h3 className="mb-5 border-b border-gray-100 pb-3 text-base font-semibold text-gray-800">
      {title}
    </h3>

    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {children}
    </div>
  </section>
);

const CompanyInfo = () => {
  const [values, setValues] = useState<CompanyFormData>(initialForm);

  const [company, setCompany] = useState<Company | null>(null);

  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const loadCompany = async () => {
      try {
        setLoading(true);
        setLoadError('');

        const response = await companyAPI.getCompany();

        if (response.company) {
          setCompany(response.company);
          setValues(toFormValues(response.company));
        } else {
          setCompany(null);
          setValues(initialForm);
        }
      } catch (err) {
        setLoadError(
          err instanceof Error
            ? err.message
            : 'Unable to load company details.',
        );
      } finally {
        setLoading(false);
      }
    };

    loadCompany();
  }, []);

  useEffect(() => {
    if (!logoPreview) return;

    return () => {
      URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setValues((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFieldErrors((previous) => ({
      ...previous,
      [name]: undefined,
    }));

    setError('');
    setSuccess('');
  };

  const handleLogoChange = (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg'];
    const maxSize = 2 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setError('Only PNG and JPG images are allowed.');
      e.target.value = '';
      return;
    }

    if (file.size > maxSize) {
      setError('Logo size must not exceed 2 MB.');
      e.target.value = '';
      return;
    }

    setLogo(file);
    setLogoPreview(URL.createObjectURL(file));
    setError('');
    setSuccess('');
  };

  const removeLogo = () => {
    setLogo(null);
    setLogoPreview('');
    setError('');

    const input = document.getElementById(
      'company-logo',
    ) as HTMLInputElement | null;

    if (input) input.value = '';
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError('');
    setSuccess('');
    setFieldErrors({});

    const errors = validateCompany(values);

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please correct the highlighted fields.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      Object.entries(values).forEach(([key, value]) => {
        formData.append(key, value ?? '');
      });

      if (logo) {
        formData.append('logo', logo);
      }

      const response = await companyAPI.saveCompany(formData);

      setCompany(response.company);
      setValues(toFormValues(response.company));

      setLogo(null);
      setLogoPreview('');

      const input = document.getElementById(
        'company-logo',
      ) as HTMLInputElement | null;

      if (input) input.value = '';

      setSuccess(
        response.message || 'Company details saved successfully.',
      );

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to save company details.',
      );

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setValues(company ? toFormValues(company) : initialForm);
    setLogo(null);
    setLogoPreview('');
    setError('');
    setSuccess('');
    setFieldErrors({});

    const input = document.getElementById(
      'company-logo',
    ) as HTMLInputElement | null;

    if (input) input.value = '';
  };

  const displayedLogo = logoPreview
    ? logoPreview
    : company?.logo_path
      ? getLogoUrl(company.logo_path)
      : '';

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading company details...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          Company Information
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Manage your company profile, contact, address and bank details.
        </p>
      </div>

      {loadError && (
        <div className="flex items-center justify-between rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{loadError}</span>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="text-left space-y-6">
        <FormSection title="Company Details">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Company Logo
            </label>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                {displayedLogo ? (
                  <img
                    src={displayedLogo}
                    alt="Company logo"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-gray-400">
                    No Logo
                  </span>
                )}
              </div>

              <div>
                <input
                  id="company-logo"
                  type="file"
                  accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                  onChange={handleLogoChange}
                  className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
                />

                <p className="mt-1 text-xs text-gray-500">
                  PNG or JPG. Maximum file size: 2 MB.
                </p>

                {(logo || displayedLogo) && (
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="mt-2 text-xs font-medium text-red-600 hover:underline"
                  >
                    Clear selected logo
                  </button>
                )}
              </div>
            </div>
          </div>

          <InputField
            label="Company Name"
            name="company_name"
            value={values.company_name}
            onChange={handleChange}
            error={fieldErrors.company_name}
            required
          />

          <InputField
            label="Trade Name"
            name="trade_name"
            value={values.trade_name}
            onChange={handleChange}
          />

          <InputField
            label="GSTIN"
            name="gstin"
            value={values.gstin}
            onChange={handleChange}
            error={fieldErrors.gstin}
          />

          <InputField
            label="PAN"
            name="pan"
            value={values.pan}
            onChange={handleChange}
            error={fieldErrors.pan}
          />
        </FormSection>

        <FormSection title="Contact Information">
          <InputField
            label="Email"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            error={fieldErrors.email}
          />

          <InputField
            label="Phone"
            name="phone"
            type="tel"
            value={values.phone}
            onChange={handleChange}
          />

          <InputField
            label="Website"
            name="website"
            value={values.website}
            onChange={handleChange}
          />
        </FormSection>

        <FormSection title="Registered Address">
          <InputField
            label="Address Line 1"
            name="address_line1"
            value={values.address_line1}
            onChange={handleChange}
          />

          <InputField
            label="Address Line 2"
            name="address_line2"
            value={values.address_line2}
            onChange={handleChange}
          />

          <InputField
            label="City"
            name="city"
            value={values.city}
            onChange={handleChange}
          />

          <InputField
            label="State"
            name="state"
            value={values.state}
            onChange={handleChange}
          />

          <InputField
            label="State Code"
            name="state_code"
            value={values.state_code}
            onChange={handleChange}
            error={fieldErrors.state_code}
          />

          <InputField
            label="Pincode"
            name="pincode"
            value={values.pincode}
            onChange={handleChange}
            error={fieldErrors.pincode}
          />

          <InputField
            label="Country"
            name="country"
            value={values.country}
            onChange={handleChange}
          />
        </FormSection>

        <FormSection title="Bank Details">
          <InputField
            label="Bank Name"
            name="bank_name"
            value={values.bank_name}
            onChange={handleChange}
          />

          <InputField
            label="Account Name"
            name="bank_account_name"
            value={values.bank_account_name}
            onChange={handleChange}
          />

          <InputField
            label="Account Number"
            name="bank_account_number"
            value={values.bank_account_number}
            onChange={handleChange}
          />

          <InputField
            label="IFSC Code"
            name="bank_ifsc"
            value={values.bank_ifsc}
            onChange={handleChange}
            error={fieldErrors.bank_ifsc}
          />
        </FormSection>

        <FormSection title="Invoice Settings">
          <div className="md:col-span-2">
            <InputField
              label="Authorised Signatory"
              name="authorised_signatory"
              value={values.authorised_signatory}
              onChange={handleChange}
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="invoice_footer"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Invoice Footer
            </label>

            <textarea
              id="invoice_footer"
              name="invoice_footer"
              rows={4}
              value={values.invoice_footer}
              onChange={handleChange}
              placeholder="Enter invoice footer text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </FormSection>

        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reset
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Company'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyInfo;