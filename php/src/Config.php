<?php
namespace App;

class Config {
    private static array $data = [];
    public static function set(array $data): void { self::$data = $data; }
    public static function get(string $key, $default = null) {
        $parts = explode('.', $key);
        $cur = self::$data;
        foreach ($parts as $p) {
            if (!is_array($cur) || !array_key_exists($p, $cur)) return $default;
            $cur = $cur[$p];
        }
        return $cur;
    }
}
