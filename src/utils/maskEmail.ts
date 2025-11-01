export function maskEmail(email: string) {
    const [name, domain] = email.split("@");
    const maskedName = name.length <= 2 ? name[0] + "*" : name[0] + "*".repeat(Math.max(1, name.length - 2)) + name.slice(-1);
    return `${maskedName}@${domain}`;
}