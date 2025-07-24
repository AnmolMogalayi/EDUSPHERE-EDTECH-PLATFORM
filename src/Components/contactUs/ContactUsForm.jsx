import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Select from 'react-select';
import { apiConnector } from '../../services/apiConnector';
import { contactusEndpoint } from '../../services/apis';
import toast from 'react-hot-toast';
import countryCodeData from '../../data/countrycode.json';

const ContactUsForm = () => {
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState({
    label: '+91 - India',
    value: '+91',
  });
  const [phoneMaxLength, setPhoneMaxLength] = useState(10); // default for India

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitSuccessful },
  } = useForm();

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset({
        firstName: '',
        lastName: '',
        email: '',
        message: '',
        phoneNo: '',
      });
    }
  }, [reset, isSubmitSuccessful]);

  const countryOptions = countryCodeData.map((item) => ({
    label: `${item.code} - ${item.country}`,
    value: item.code,
  }));

  const handleCountryChange = (selected) => {
    setSelectedCountry(selected);
    setValue('countryCode', selected.value);

    // Set phone maxLength
    if (selected.value === '+91') {
      setPhoneMaxLength(10);
    } else {
      setPhoneMaxLength(15);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const phoneNo = data.countryCode + ' ' + data.phoneNo;
      const { firstName, lastName, email, message } = data;

      const res = await apiConnector('POST', contactusEndpoint.CONTACT_US_API, {
        firstName,
        lastName,
        email,
        message,
        phoneNo,
      });

      if (res.data.success === true) {
        toast.success('Message sent successfully');
      } else {
        toast.error('Something went wrong');
      }

      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  return loading ? (
    <div className=".custom-loader w-[100%] pt-[30%] pb-[30%]">
      <div className="custom-loader"></div>
    </div>
  ) : (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-7">

        {/* First & Last Name */}
        <div className="flex flex-col gap-5 lg:flex-row">
          <div className="flex flex-col gap-2 lg:w-[48%]">
            <label htmlFor="firstname" className="lable-style">First Name</label>
            <input
              type="text"
              id="firstname"
              placeholder="Enter first name"
              {...register('firstName', { required: true })}
              className="form-style"
            />
            {errors.firstName && <span className="text-yellow-25">Enter Firstname *</span>}
          </div>

          <div className="flex flex-col gap-2 lg:w-[48%]">
            <label htmlFor="lastname" className="lable-style">Last Name</label>
            <input
              type="text"
              id="lastname"
              placeholder="Enter last name"
              {...register('lastName')}
              className="form-style"
            />
            {errors.lastName && <span className="text-yellow-25">Enter Lastname</span>}
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="lable-style">Email Address</label>
          <input
            type="email"
            id="email"
            placeholder="Enter email address"
            {...register('email', { required: true })}
            className="form-style"
          />
          {errors.email && <span className="text-yellow-25">Enter Email *</span>}
        </div>

        {/* Phone Number with Country Code */}
        <div className="flex flex-col gap-2">
          <label htmlFor="phoneNo" className="lable-style">Phone Number</label>
          <div className="flex gap-5">
            {/* Country Select */}
            <div className="w-[250px]">
              <Select
                options={countryOptions}
                value={selectedCountry}
                onChange={handleCountryChange}
                placeholder="Search country code"
                styles={{
                  control: (base) => ({
                    ...base,
                    backgroundColor: '#1a1a1a',
                    color: 'white',
                    borderColor: '#444',
                  }),
                  menu: (base) => ({
                    ...base,
                    backgroundColor: '#1a1a1a',
                    color: 'white',
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected
                      ? '#333'
                      : state.isFocused
                      ? '#2a2a2a'
                      : '#1a1a1a',
                    color: 'white',
                    cursor: 'pointer',
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: 'white',
                  }),
                  input: (base) => ({
                    ...base,
                    color: 'white',
                  }),
                }}
              />
              <input
                type="hidden"
                {...register('countryCode', { required: true })}
                value={selectedCountry?.value || ''}
              />
              {errors.countryCode && <span className="text-yellow-25">Select a country code *</span>}
            </div>

            {/* Phone Input */}
            <div className="flex flex-col w-full">
              <input
                type="tel"
                id="phonenumber"
                placeholder="Enter phone number"
                className="form-style"
                maxLength={phoneMaxLength}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9]/g, '');
                }}
                {...register('phoneNo', {
                  required: { value: true, message: 'Enter phone number *' },
                  minLength: {
                    value: phoneMaxLength,
                    message: `Phone number must be exactly ${phoneMaxLength} digits`,
                  },
                  maxLength: {
                    value: phoneMaxLength,
                    message: `Phone number must be exactly ${phoneMaxLength} digits`,
                  },
                  pattern: {
                    value: /^[0-9]+$/,
                    message: 'Only digits allowed',
                  },
                })}
              />
              {errors.phoneNo && <span className="text-yellow-25">{errors.phoneNo.message}</span>}
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="flex flex-col gap-2">
          <label htmlFor="message" className="lable-style">Message</label>
          <textarea
            id="message"
            cols="30"
            rows="7"
            placeholder="Enter your message here"
            className="form-style"
            {...register('message', { required: true })}
          />
          {errors.message && <span className="text-yellow-25">Enter your message *</span>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="rounded-md bg-yellow-50 px-6 py-3 text-center text-[13px] font-bold text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.18)] transition-all duration-200 hover:scale-95 hover:shadow-none disabled:bg-richblack-500 sm:text-[16px]"
        >
          Send Message
        </button>
      </form>
    </div>
  );
};

export default ContactUsForm;
