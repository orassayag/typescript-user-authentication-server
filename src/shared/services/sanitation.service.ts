export class SanitationService {
  readonly REGEX_NAME = /^[0-9a-zA-Z_]+$/;
  readonly REGEX_EMAIL = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  readonly REGEX_APPNAME = /^[0-9a-zA-Z_ ]+$/;
  // readonly REGEX_PASSWORD = /^(?=.*[\d])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#\$%\^*])[\w!@#\$%\^*]{2,}$/;
  readonly REGEX_PASSWORD = /^[\w!@#\$%\^*]{2,}$/;
  readonly REGEX_LINK = /[\w:/.]+$/;

  readonly SANITIZERS = {
    name: { label: 'name', minLen: 2, maxLen: 15, regex: this.REGEX_NAME },
    userName: { label: 'user name', minLen: 2, maxLen: 15, regex: this.REGEX_NAME },
    appName: { label: 'app name', minLen: 2, maxLen: 35, regex: this.REGEX_APPNAME },
    email: { label: 'email', minLen: 9, maxLen: 80, regex: this.REGEX_EMAIL },
    link: { label: 'link', minLen: 9, maxLen: 80, regex: this.REGEX_LINK },
    password: { label: 'password', minLen: 6, maxLen: 30, regex: this.REGEX_PASSWORD }
  };

  sanitize(data) {
    let msg = '';
    if (Array.isArray(data)) {
      for (let i = 0, len = data.length; i < len && msg === ''; i++) {
        msg = this.sanitizeField(data[i]);
      }
    } else {
      msg = this.sanitizeField(data);
    }
    return msg;
  }

  sanitizeField(item) {
    const sanitizer = this.SANITIZERS[item.name];
    const label = item.label || sanitizer.label;
    item.value = item.value.trim();
    if (!item.value) {
      return `field '${label}' is empty`;
    } else if (item.value.length < sanitizer.minLen) {
      return `field '${label}' should be at least ${sanitizer.minLen}' characters`;
    } else if (item.value.length > sanitizer.maxLen) {
      return `field '${label}' should be a maximum of ${sanitizer.maxLen}' characters`;
    } else if (sanitizer.regex && !this.isRegex(item.value, sanitizer.regex)) {
      return `field '${label}' is not valid`;
    } else {
      return '';
    }
  }

  isRegex(value, regex) {
    let isValid = true;
    if (Array.isArray(regex)) {
      for (let i = 0, len = regex.length; i < len && isValid; i++) {
        isValid = regex[i].test(value);
      }
    } else {
      isValid = regex.test(value);
    }
    return isValid;
  }
}

export const sanitationService: SanitationService = new SanitationService();
