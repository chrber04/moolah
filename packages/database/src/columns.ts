/* eslint-disable @typescript-eslint/naming-convention */
import { customType } from "drizzle-orm/sqlite-core";

export const textEnum = <V extends Record<string, string>, RV = V[keyof V]>(
	columnName: string,
	enumObj: V
) => {
	const values = Object.values(enumObj);
	return customType<{ data: string; driverData: string }>({
		dataType() {
			return "text";
		},
		toDriver(value: string) {
			if (!values.includes(value)) {
				throw Error(`Invalid value for ${columnName}. Expected: ${values.join(", ")}`);
			}
			return value;
		}
	})(columnName).$type<RV>();
};
