import * as v from "valibot";

export type IpAddressMessages = {
	/**
	 * Message for when the value is not a string
	 * @default "Value must be a string"
	 */
	notAString?: string;
	/**
	 * Message for when the value is not a valid IPv4 address
	 * @default "Invalid IPv4 address"
	 */
	invalidIpv4?: string;
	/**
	 * Message for when the value is not a valid IPv6 address
	 * @default "Invalid IPv6 address"
	 */
	invalidIpv6?: string;
	/**
	 * Message for when the value is neither IPv4 nor IPv6
	 * @default "Invalid IP address. Must be a valid IPv4 or IPv6 address"
	 */
	invalidIpAddress?: string;
};

export function createIpAddressSchema(messages?: IpAddressMessages) {
	const ipv4Schema = v.pipe(
		v.string(messages?.notAString ?? "Value must be a string"),
		v.regex(
			/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
			messages?.invalidIpv4 ?? "Invalid IPv4 address"
		)
	);

	const ipv6Schema = v.pipe(
		v.string(messages?.notAString ?? "Value must be a string"),
		v.regex(
			/^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/,
			messages?.invalidIpv6 ?? "Invalid IPv6 address"
		)
	);

	return v.union(
		[ipv4Schema, ipv6Schema],
		messages?.invalidIpAddress ?? "Invalid IP address. Must be a valid IPv4 or IPv6 address"
	);
}
export const ipAddressSchema = createIpAddressSchema();
