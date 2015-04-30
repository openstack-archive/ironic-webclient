/*
 * Copyright (c) 2015 Hewlett-Packard Development Company, L.P.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License'); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

/**
 * This file provides four storage abstraction providers with the same
 * interface. Available are $$cookieStorage, $$localStorage, $$sessionStorage,
 * $$memoryStorage, and $$persistentStorage, and they all implement
 * isSupported(), set(), get(), remove(), keys(), clearAll(), and length().
 * They each support typed key/value data.
 */

/**
 * A $$sessionStorage service behind a common API. If sessionStorage is not
 * supported, this will default to a simple in-memory storage, and log a
 * warning to the console.
 */
angular.module('openstack').factory('$$sessionStorage',
    function ($$memoryStorage, $window, $log) {
        'use strict';

        /**
         * Detect whether sessionStorage is supported, and make sure we can
         * write to it.
         */
        var isSupported = (function () {
            var type = 'sessionStorage';

            // Does it exist?
            if (!(type in $window || $window[type] === null)) {
                return false;
            }

            // Can we write to it?
            var testKey = '__' + Math.round(Math.random() * 1e7);
            var storageImpl = $window[type];
            try {
                storageImpl.setItem(testKey, '');
                storageImpl.removeItem(testKey);
                return true;
            } catch (e) {
                return false;
            }
        })();

        return {
            /**
             * Is this storage type supported?
             *
             * @returns {boolean}
             */
            isSupported: function () {
                return isSupported;
            },

            /**
             * Set a value of the provided key. If the
             * value already exists it will be overwritten.
             *
             * @param key The key to store the value at.
             * @param value The value to store.
             * @return The stored value.
             */
            set: function (key, value) {
                if (isSupported) {
                    $window.sessionStorage.setItem(key, value);
                } else {
                    $log.warn('$$sessionStorage not supported, using $$memoryStorage');
                    $$memoryStorage.set(key, value);
                }

                return value;
            },

            /**
             * Retrieve a value from this storage provider.
             *
             * @param key The key to retrieve.
             * @return The value, or null if it is not set.
             */
            get: function (key) {
                if (isSupported) {
                    return $window.sessionStorage.getItem(key);
                } else {
                    $log.warn('$$sessionStorage not supported, using $$memoryStorage');
                    return $$memoryStorage.get(key);
                }
            },

            /**
             * Remove a specific value from the storage provider.
             *
             * @param key The key to remove.
             */
            remove: function (key) {
                if (isSupported) {
                    return $window.sessionStorage.removeItem(key);
                } else {
                    $log.warn('$$sessionStorage not supported, using $$memoryStorage');
                    return $$memoryStorage.remove(key);
                }
            },

            /**
             * Return all the keys currently registered.
             *
             * @returns {Array}
             */
            keys: function () {
                if (isSupported) {
                    var keys = [];
                    for (var i = 0; i < $window.sessionStorage.length; i++) {
                        keys.push($window.sessionStorage.key(i));
                    }
                    return keys;
                } else {
                    $log.warn('$$sessionStorage not supported, using $$memoryStorage');
                    return $$memoryStorage.keys();
                }
            },

            /**
             * Remove everything from the memory storage mechanism.
             */
            clearAll: function () {
                if (isSupported) {
                    var keys = this.keys();
                    for (var i = 0; i < keys.length; i++) {
                        this.remove(keys[i]);
                    }
                } else {
                    $log.warn('$$sessionStorage not supported, using $$memoryStorage');
                    return $$memoryStorage.keys();
                }
            },

            /**
             * Return the size of the current memory storage.
             *
             * @returns {number}
             */
            length: function () {
                if (isSupported) {
                    return $window.sessionStorage.length;
                } else {
                    $log.warn('$$sessionStorage not supported, using $$memoryStorage');
                    return $$memoryStorage.length();
                }
            }
        };
    });

/**
 * A $$localStorage service behind a common API. If localStorage is not
 * supported, this will default to a simple in-memory storage, and log a
 * warning to the console. If you want a provider that gracefully degrades, use
 * $$persistentStorage.
 */
angular.module('openstack').factory('$$localStorage',
    function ($$memoryStorage, $window, $log) {
        'use strict';

        /**
         * Detect whether localStorage is supported, and make sure we can write
         * to it.
         */
        var isSupported = (function () {
            var type = 'localStorage';

            // Does it exist?
            if (!(type in $window || $window[type] === null)) {
                return false;
            }

            // Can we write to it?
            var testKey = '__' + Math.round(Math.random() * 1e7);
            var storageImpl = $window[type];
            try {
                storageImpl.setItem(testKey, '');
                storageImpl.removeItem(testKey);
                return true;
            } catch (e) {
                return false;
            }
        })();

        return {
            /**
             * Is this storage type supported?
             *
             * @returns {boolean}
             */
            isSupported: function () {
                return isSupported;
            },

            /**
             * Set a value of the provided key. If the
             * value already exists it will be overwritten.
             *
             * @param key The key to store the value at.
             * @param value The value to store.
             * @return The stored value.
             */
            set: function (key, value) {
                if (isSupported) {
                    $window.localStorage.setItem(key, value);
                } else {
                    $log.warn('$$localStorage not supported, using $$memoryStorage');
                    $$memoryStorage.set(key, value);
                }

                return value;
            },

            /**
             * Retrieve a value from this storage provider.
             *
             * @param key The key to retrieve.
             * @return The value, or null if it is not set.
             */
            get: function (key) {
                if (isSupported) {
                    return $window.localStorage.getItem(key);
                } else {
                    $log.warn('$$localStorage not supported, using $$memoryStorage');
                    return $$memoryStorage.get(key);
                }
            },

            /**
             * Remove a specific value from the storage provider.
             *
             * @param key The key to remove.
             */
            remove: function (key) {
                if (isSupported) {
                    return $window.localStorage.removeItem(key);
                } else {
                    $log.warn('$$localStorage not supported, using $$memoryStorage');
                    return $$memoryStorage.remove(key);
                }
            },

            /**
             * Return all the keys currently registered.
             *
             * @returns {Array}
             */
            keys: function () {
                if (isSupported) {
                    var keys = [];
                    for (var i = 0; i < $window.localStorage.length; i++) {
                        keys.push($window.localStorage.key(i));
                    }
                    return keys;
                } else {
                    $log.warn('$$localStorage not supported, using $$memoryStorage');
                    return $$memoryStorage.keys();
                }
            },

            /**
             * Remove everything from the memory storage mechanism.
             */
            clearAll: function () {
                if (isSupported) {
                    var keys = this.keys();
                    for (var i = 0; i < keys.length; i++) {
                        this.remove(keys[i]);
                    }
                } else {
                    $log.warn('$$localStorage not supported, using $$memoryStorage');
                    return $$memoryStorage.keys();
                }
            },

            /**
             * Return the size of the current memory storage.
             *
             * @returns {number}
             */
            length: function () {
                if (isSupported) {
                    return $window.localStorage.length;
                } else {
                    $log.warn('$$localStorage not supported, using $$memoryStorage');
                    return $$memoryStorage.length();
                }
            }
        };
    });

/**
 * This file provides the $$secureStorage service behind a common API. If
 * secureStorage is not supported, this will default to a simple in-memory
 * storage, and log a warning to the console. If you want a provider
 * that gracefully degrades, use $$persistentStorage.
 */
angular.module('openstack').factory('$$secureStorage',
    function ($storageFactory) {
        'use strict';

        return $storageFactory.$get('secureStorage');
    });


/**
 * This provides a memory-based key/value storage mechanism. It's provided as
 * a fallback option for all other storage mechanisms, to prevent unexpected
 * runtime failures.
 */
angular.module('openstack').factory('$$memoryStorage',
    function () {
        'use strict';

        var memoryStorage = {};

        return {
            /**
             * Is this storage type supported?
             *
             * @returns {boolean}
             */
            isSupported: function () {
                return true;
            },

            /**
             * Set a value to the provided key in memory storage. If the
             * value already exists it will be overwritten.
             *
             * @param key The key to store the value at.
             * @param value The value to store.
             * @return The stored value.
             */
            set: function (key, value) {
                memoryStorage[key] = value;

                return value;
            },

            /**
             * Retrieve a value from this storage provider.
             *
             * @param key The key to retrieve.
             * @return The value, or null if it is not set.
             */
            get: function (key) {
                if (memoryStorage.hasOwnProperty(key)) {
                    return memoryStorage[key];
                }
                return null;
            },

            /**
             * Remove a specific value from the storage provider.
             *
             * @param key The key to remove.
             */
            remove: function (key) {
                delete memoryStorage[key];
            },

            /**
             * Return all the keys currently registered.
             *
             * @returns {Array}
             */
            keys: function () {
                var keys = [];
                for (var key in memoryStorage) {
                    keys.push(key);
                }
                return keys;
            },

            /**
             * Remove everything from the memory storage mechanism.
             */
            clearAll: function () {
                var keys = [];
                for (var key in memoryStorage) {
                    keys.push(key);
                }

                for (var i = 0; i < keys.length; i++) {
                    delete memoryStorage[keys[i]];
                }
            },

            /**
             * Return the size of the current memory storage.
             *
             * @returns {number}
             */
            length: function () {
                return this.keys().length;
            }
        };
    });

/**
 * This file provides an implementation of the storage API, backed by cookies.
 * This particular implementation is not intelligent: It will access the
 * cookie for this domain, as configured by the $cookieProvider, and will
 * grant access to all values stored this way.
 */
angular.module('openstack').factory('$$cookieStorage',
    function ($cookies) {
        'use strict';

        return {
            /**
             * Is this storage type supported?
             *
             * @returns {boolean}
             */
            isSupported: function () {
                return true;
            },

            /**
             * Set a value to the provided key in memory storage. If the
             * value already exists it will be overwritten.
             *
             * @param key The key to store the value at.
             * @param value The value to store.
             * @return The stored value.
             */
            set: function (key, value) {
                $cookies.put(key, value);
                return value;
            },

            /**
             * Retrieve a value from this storage provider.
             *
             * @param key The key to retrieve.
             * @return The value, or null if it is not set.
             */
            get: function (key) {
                return $cookies.get(key) || null;
            },

            /**
             * Remove a specific value from the storage provider.
             *
             * @param key The key to remove.
             */
            remove: function (key) {
                $cookies.remove(key);
            },

            /**
             * Return all the keys currently registered.
             *
             * @returns {Array}
             */
            keys: function () {
                var all = $cookies.getAll();
                var keys = [];
                for (var key in all) {
                    keys.push(key);
                }
                return keys;
            },

            /**
             * Remove everything from the memory storage mechanism.
             */
            clearAll: function () {
                var all = $cookies.getAll();
                for (var key in all) {
                    $cookies.remove(key);
                }
            },

            /**
             * Return the size of the current memory storage.
             *
             * @returns {number}
             */
            length: function () {
                return this.keys().length;
            }
        };
    });

/**
 * A convenience injector that automatically selects the most secure, and most
 * persistent, storage mechanism available in the current runtime. This does
 * not include sessionStorage, which must be used independently.
 */
angular.module('openstack').factory('$$persistentStorage',
    function ($log, $$cookieStorage, $$memoryStorage, $$localStorage) {
        'use strict';

        // Check for local storage.
        if ($$localStorage.isSupported()) {
            return $$localStorage;
        }

        // Check for cookie storage.
        if ($$cookieStorage.isSupported()) {
            return $$cookieStorage;
        }

        $log.warn('Warning: No persistent storage mechanism supported, all' +
        ' storage will be transient.');
        return $$memoryStorage;
    });
