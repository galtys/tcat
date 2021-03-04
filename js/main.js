"use strict";

(function(){

const $JSRTS = {
    throw: function (x) {
        throw x;
    },
    Lazy: function (e) {
        this.js_idris_lazy_calc = e;
        this.js_idris_lazy_val = void 0;
    },
    force: function (x) {
        if (x === undefined || x.js_idris_lazy_calc === undefined) {
            return x
        } else {
            if (x.js_idris_lazy_val === undefined) {
                x.js_idris_lazy_val = x.js_idris_lazy_calc()
            }
            return x.js_idris_lazy_val
        }
    },
    prim_strSubstr: function (offset, len, str) {
        return str.substr(Math.max(0, offset), Math.max(0, len))
    }
};
$JSRTS.prim_systemInfo = function (index) {
    switch (index) {
        case 0:
            return "javascript";
        case 1:
            return navigator.platform;
    }
    return "";
};

$JSRTS.prim_writeStr = function (x) { return console.log(x) };

$JSRTS.prim_readStr = function () { return prompt('Prelude.getLine') };

$JSRTS.die = function (message) { throw new Error(message) };
$JSRTS.jsbn = (function () {

  // Copyright (c) 2005  Tom Wu
  // All Rights Reserved.
  // See "LICENSE" for details.

  // Basic JavaScript BN library - subset useful for RSA encryption.

  // Bits per digit
  var dbits;

  // JavaScript engine analysis
  var canary = 0xdeadbeefcafe;
  var j_lm = ((canary & 0xffffff) == 0xefcafe);

  // (public) Constructor
  function BigInteger(a, b, c) {
    if (a != null)
      if ("number" == typeof a) this.fromNumber(a, b, c);
      else if (b == null && "string" != typeof a) this.fromString(a, 256);
      else this.fromString(a, b);
  }

  // return new, unset BigInteger
  function nbi() { return new BigInteger(null); }

  // am: Compute w_j += (x*this_i), propagate carries,
  // c is initial carry, returns final carry.
  // c < 3*dvalue, x < 2*dvalue, this_i < dvalue
  // We need to select the fastest one that works in this environment.

  // am1: use a single mult and divide to get the high bits,
  // max digit bits should be 26 because
  // max internal value = 2*dvalue^2-2*dvalue (< 2^53)
  function am1(i, x, w, j, c, n) {
    while (--n >= 0) {
      var v = x * this[i++] + w[j] + c;
      c = Math.floor(v / 0x4000000);
      w[j++] = v & 0x3ffffff;
    }
    return c;
  }
  // am2 avoids a big mult-and-extract completely.
  // Max digit bits should be <= 30 because we do bitwise ops
  // on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
  function am2(i, x, w, j, c, n) {
    var xl = x & 0x7fff, xh = x >> 15;
    while (--n >= 0) {
      var l = this[i] & 0x7fff;
      var h = this[i++] >> 15;
      var m = xh * l + h * xl;
      l = xl * l + ((m & 0x7fff) << 15) + w[j] + (c & 0x3fffffff);
      c = (l >>> 30) + (m >>> 15) + xh * h + (c >>> 30);
      w[j++] = l & 0x3fffffff;
    }
    return c;
  }
  // Alternately, set max digit bits to 28 since some
  // browsers slow down when dealing with 32-bit numbers.
  function am3(i, x, w, j, c, n) {
    var xl = x & 0x3fff, xh = x >> 14;
    while (--n >= 0) {
      var l = this[i] & 0x3fff;
      var h = this[i++] >> 14;
      var m = xh * l + h * xl;
      l = xl * l + ((m & 0x3fff) << 14) + w[j] + c;
      c = (l >> 28) + (m >> 14) + xh * h;
      w[j++] = l & 0xfffffff;
    }
    return c;
  }
  var inBrowser = typeof navigator !== "undefined";
  if (inBrowser && j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
    BigInteger.prototype.am = am2;
    dbits = 30;
  }
  else if (inBrowser && j_lm && (navigator.appName != "Netscape")) {
    BigInteger.prototype.am = am1;
    dbits = 26;
  }
  else { // Mozilla/Netscape seems to prefer am3
    BigInteger.prototype.am = am3;
    dbits = 28;
  }

  BigInteger.prototype.DB = dbits;
  BigInteger.prototype.DM = ((1 << dbits) - 1);
  BigInteger.prototype.DV = (1 << dbits);

  var BI_FP = 52;
  BigInteger.prototype.FV = Math.pow(2, BI_FP);
  BigInteger.prototype.F1 = BI_FP - dbits;
  BigInteger.prototype.F2 = 2 * dbits - BI_FP;

  // Digit conversions
  var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
  var BI_RC = new Array();
  var rr, vv;
  rr = "0".charCodeAt(0);
  for (vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
  rr = "a".charCodeAt(0);
  for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
  rr = "A".charCodeAt(0);
  for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

  function int2char(n) { return BI_RM.charAt(n); }
  function intAt(s, i) {
    var c = BI_RC[s.charCodeAt(i)];
    return (c == null) ? -1 : c;
  }

  // (protected) copy this to r
  function bnpCopyTo(r) {
    for (var i = this.t - 1; i >= 0; --i) r[i] = this[i];
    r.t = this.t;
    r.s = this.s;
  }

  // (protected) set from integer value x, -DV <= x < DV
  function bnpFromInt(x) {
    this.t = 1;
    this.s = (x < 0) ? -1 : 0;
    if (x > 0) this[0] = x;
    else if (x < -1) this[0] = x + this.DV;
    else this.t = 0;
  }

  // return bigint initialized to value
  function nbv(i) { var r = nbi(); r.fromInt(i); return r; }

  // (protected) set from string and radix
  function bnpFromString(s, b) {
    var k;
    if (b == 16) k = 4;
    else if (b == 8) k = 3;
    else if (b == 256) k = 8; // byte array
    else if (b == 2) k = 1;
    else if (b == 32) k = 5;
    else if (b == 4) k = 2;
    else { this.fromRadix(s, b); return; }
    this.t = 0;
    this.s = 0;
    var i = s.length, mi = false, sh = 0;
    while (--i >= 0) {
      var x = (k == 8) ? s[i] & 0xff : intAt(s, i);
      if (x < 0) {
        if (s.charAt(i) == "-") mi = true;
        continue;
      }
      mi = false;
      if (sh == 0)
        this[this.t++] = x;
      else if (sh + k > this.DB) {
        this[this.t - 1] |= (x & ((1 << (this.DB - sh)) - 1)) << sh;
        this[this.t++] = (x >> (this.DB - sh));
      }
      else
        this[this.t - 1] |= x << sh;
      sh += k;
      if (sh >= this.DB) sh -= this.DB;
    }
    if (k == 8 && (s[0] & 0x80) != 0) {
      this.s = -1;
      if (sh > 0) this[this.t - 1] |= ((1 << (this.DB - sh)) - 1) << sh;
    }
    this.clamp();
    if (mi) BigInteger.ZERO.subTo(this, this);
  }

  // (protected) clamp off excess high words
  function bnpClamp() {
    var c = this.s & this.DM;
    while (this.t > 0 && this[this.t - 1] == c)--this.t;
  }

  // (public) return string representation in given radix
  function bnToString(b) {
    if (this.s < 0) return "-" + this.negate().toString(b);
    var k;
    if (b == 16) k = 4;
    else if (b == 8) k = 3;
    else if (b == 2) k = 1;
    else if (b == 32) k = 5;
    else if (b == 4) k = 2;
    else return this.toRadix(b);
    var km = (1 << k) - 1, d, m = false, r = "", i = this.t;
    var p = this.DB - (i * this.DB) % k;
    if (i-- > 0) {
      if (p < this.DB && (d = this[i] >> p) > 0) { m = true; r = int2char(d); }
      while (i >= 0) {
        if (p < k) {
          d = (this[i] & ((1 << p) - 1)) << (k - p);
          d |= this[--i] >> (p += this.DB - k);
        }
        else {
          d = (this[i] >> (p -= k)) & km;
          if (p <= 0) { p += this.DB; --i; }
        }
        if (d > 0) m = true;
        if (m) r += int2char(d);
      }
    }
    return m ? r : "0";
  }

  // (public) -this
  function bnNegate() { var r = nbi(); BigInteger.ZERO.subTo(this, r); return r; }

  // (public) |this|
  function bnAbs() { return (this.s < 0) ? this.negate() : this; }

  // (public) return + if this > a, - if this < a, 0 if equal
  function bnCompareTo(a) {
    var r = this.s - a.s;
    if (r != 0) return r;
    var i = this.t;
    r = i - a.t;
    if (r != 0) return (this.s < 0) ? -r : r;
    while (--i >= 0) if ((r = this[i] - a[i]) != 0) return r;
    return 0;
  }

  // returns bit length of the integer x
  function nbits(x) {
    var r = 1, t;
    if ((t = x >>> 16) != 0) { x = t; r += 16; }
    if ((t = x >> 8) != 0) { x = t; r += 8; }
    if ((t = x >> 4) != 0) { x = t; r += 4; }
    if ((t = x >> 2) != 0) { x = t; r += 2; }
    if ((t = x >> 1) != 0) { x = t; r += 1; }
    return r;
  }

  // (public) return the number of bits in "this"
  function bnBitLength() {
    if (this.t <= 0) return 0;
    return this.DB * (this.t - 1) + nbits(this[this.t - 1] ^ (this.s & this.DM));
  }

  // (protected) r = this << n*DB
  function bnpDLShiftTo(n, r) {
    var i;
    for (i = this.t - 1; i >= 0; --i) r[i + n] = this[i];
    for (i = n - 1; i >= 0; --i) r[i] = 0;
    r.t = this.t + n;
    r.s = this.s;
  }

  // (protected) r = this >> n*DB
  function bnpDRShiftTo(n, r) {
    for (var i = n; i < this.t; ++i) r[i - n] = this[i];
    r.t = Math.max(this.t - n, 0);
    r.s = this.s;
  }

  // (protected) r = this << n
  function bnpLShiftTo(n, r) {
    var bs = n % this.DB;
    var cbs = this.DB - bs;
    var bm = (1 << cbs) - 1;
    var ds = Math.floor(n / this.DB), c = (this.s << bs) & this.DM, i;
    for (i = this.t - 1; i >= 0; --i) {
      r[i + ds + 1] = (this[i] >> cbs) | c;
      c = (this[i] & bm) << bs;
    }
    for (i = ds - 1; i >= 0; --i) r[i] = 0;
    r[ds] = c;
    r.t = this.t + ds + 1;
    r.s = this.s;
    r.clamp();
  }

  // (protected) r = this >> n
  function bnpRShiftTo(n, r) {
    r.s = this.s;
    var ds = Math.floor(n / this.DB);
    if (ds >= this.t) { r.t = 0; return; }
    var bs = n % this.DB;
    var cbs = this.DB - bs;
    var bm = (1 << bs) - 1;
    r[0] = this[ds] >> bs;
    for (var i = ds + 1; i < this.t; ++i) {
      r[i - ds - 1] |= (this[i] & bm) << cbs;
      r[i - ds] = this[i] >> bs;
    }
    if (bs > 0) r[this.t - ds - 1] |= (this.s & bm) << cbs;
    r.t = this.t - ds;
    r.clamp();
  }

  // (protected) r = this - a
  function bnpSubTo(a, r) {
    var i = 0, c = 0, m = Math.min(a.t, this.t);
    while (i < m) {
      c += this[i] - a[i];
      r[i++] = c & this.DM;
      c >>= this.DB;
    }
    if (a.t < this.t) {
      c -= a.s;
      while (i < this.t) {
        c += this[i];
        r[i++] = c & this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while (i < a.t) {
        c -= a[i];
        r[i++] = c & this.DM;
        c >>= this.DB;
      }
      c -= a.s;
    }
    r.s = (c < 0) ? -1 : 0;
    if (c < -1) r[i++] = this.DV + c;
    else if (c > 0) r[i++] = c;
    r.t = i;
    r.clamp();
  }

  // (protected) r = this * a, r != this,a (HAC 14.12)
  // "this" should be the larger one if appropriate.
  function bnpMultiplyTo(a, r) {
    var x = this.abs(), y = a.abs();
    var i = x.t;
    r.t = i + y.t;
    while (--i >= 0) r[i] = 0;
    for (i = 0; i < y.t; ++i) r[i + x.t] = x.am(0, y[i], r, i, 0, x.t);
    r.s = 0;
    r.clamp();
    if (this.s != a.s) BigInteger.ZERO.subTo(r, r);
  }

  // (protected) r = this^2, r != this (HAC 14.16)
  function bnpSquareTo(r) {
    var x = this.abs();
    var i = r.t = 2 * x.t;
    while (--i >= 0) r[i] = 0;
    for (i = 0; i < x.t - 1; ++i) {
      var c = x.am(i, x[i], r, 2 * i, 0, 1);
      if ((r[i + x.t] += x.am(i + 1, 2 * x[i], r, 2 * i + 1, c, x.t - i - 1)) >= x.DV) {
        r[i + x.t] -= x.DV;
        r[i + x.t + 1] = 1;
      }
    }
    if (r.t > 0) r[r.t - 1] += x.am(i, x[i], r, 2 * i, 0, 1);
    r.s = 0;
    r.clamp();
  }

  // (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
  // r != q, this != m.  q or r may be null.
  function bnpDivRemTo(m, q, r) {
    var pm = m.abs();
    if (pm.t <= 0) return;
    var pt = this.abs();
    if (pt.t < pm.t) {
      if (q != null) q.fromInt(0);
      if (r != null) this.copyTo(r);
      return;
    }
    if (r == null) r = nbi();
    var y = nbi(), ts = this.s, ms = m.s;
    var nsh = this.DB - nbits(pm[pm.t - 1]);   // normalize modulus
    if (nsh > 0) { pm.lShiftTo(nsh, y); pt.lShiftTo(nsh, r); }
    else { pm.copyTo(y); pt.copyTo(r); }
    var ys = y.t;
    var y0 = y[ys - 1];
    if (y0 == 0) return;
    var yt = y0 * (1 << this.F1) + ((ys > 1) ? y[ys - 2] >> this.F2 : 0);
    var d1 = this.FV / yt, d2 = (1 << this.F1) / yt, e = 1 << this.F2;
    var i = r.t, j = i - ys, t = (q == null) ? nbi() : q;
    y.dlShiftTo(j, t);
    if (r.compareTo(t) >= 0) {
      r[r.t++] = 1;
      r.subTo(t, r);
    }
    BigInteger.ONE.dlShiftTo(ys, t);
    t.subTo(y, y);  // "negative" y so we can replace sub with am later
    while (y.t < ys) y[y.t++] = 0;
    while (--j >= 0) {
      // Estimate quotient digit
      var qd = (r[--i] == y0) ? this.DM : Math.floor(r[i] * d1 + (r[i - 1] + e) * d2);
      if ((r[i] += y.am(0, qd, r, j, 0, ys)) < qd) {   // Try it out
        y.dlShiftTo(j, t);
        r.subTo(t, r);
        while (r[i] < --qd) r.subTo(t, r);
      }
    }
    if (q != null) {
      r.drShiftTo(ys, q);
      if (ts != ms) BigInteger.ZERO.subTo(q, q);
    }
    r.t = ys;
    r.clamp();
    if (nsh > 0) r.rShiftTo(nsh, r); // Denormalize remainder
    if (ts < 0) BigInteger.ZERO.subTo(r, r);
  }

  // (public) this mod a
  function bnMod(a) {
    var r = nbi();
    this.abs().divRemTo(a, null, r);
    if (this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r, r);
    return r;
  }

  // Modular reduction using "classic" algorithm
  function Classic(m) { this.m = m; }
  function cConvert(x) {
    if (x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
    else return x;
  }
  function cRevert(x) { return x; }
  function cReduce(x) { x.divRemTo(this.m, null, x); }
  function cMulTo(x, y, r) { x.multiplyTo(y, r); this.reduce(r); }
  function cSqrTo(x, r) { x.squareTo(r); this.reduce(r); }

  Classic.prototype.convert = cConvert;
  Classic.prototype.revert = cRevert;
  Classic.prototype.reduce = cReduce;
  Classic.prototype.mulTo = cMulTo;
  Classic.prototype.sqrTo = cSqrTo;

  // (protected) return "-1/this % 2^DB"; useful for Mont. reduction
  // justification:
  //         xy == 1 (mod m)
  //         xy =  1+km
  //   xy(2-xy) = (1+km)(1-km)
  // x[y(2-xy)] = 1-k^2m^2
  // x[y(2-xy)] == 1 (mod m^2)
  // if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
  // should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
  // JS multiply "overflows" differently from C/C++, so care is needed here.
  function bnpInvDigit() {
    if (this.t < 1) return 0;
    var x = this[0];
    if ((x & 1) == 0) return 0;
    var y = x & 3;       // y == 1/x mod 2^2
    y = (y * (2 - (x & 0xf) * y)) & 0xf; // y == 1/x mod 2^4
    y = (y * (2 - (x & 0xff) * y)) & 0xff;   // y == 1/x mod 2^8
    y = (y * (2 - (((x & 0xffff) * y) & 0xffff))) & 0xffff;    // y == 1/x mod 2^16
    // last step - calculate inverse mod DV directly;
    // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
    y = (y * (2 - x * y % this.DV)) % this.DV;       // y == 1/x mod 2^dbits
    // we really want the negative inverse, and -DV < y < DV
    return (y > 0) ? this.DV - y : -y;
  }

  // Montgomery reduction
  function Montgomery(m) {
    this.m = m;
    this.mp = m.invDigit();
    this.mpl = this.mp & 0x7fff;
    this.mph = this.mp >> 15;
    this.um = (1 << (m.DB - 15)) - 1;
    this.mt2 = 2 * m.t;
  }

  // xR mod m
  function montConvert(x) {
    var r = nbi();
    x.abs().dlShiftTo(this.m.t, r);
    r.divRemTo(this.m, null, r);
    if (x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r, r);
    return r;
  }

  // x/R mod m
  function montRevert(x) {
    var r = nbi();
    x.copyTo(r);
    this.reduce(r);
    return r;
  }

  // x = x/R mod m (HAC 14.32)
  function montReduce(x) {
    while (x.t <= this.mt2) // pad x so am has enough room later
      x[x.t++] = 0;
    for (var i = 0; i < this.m.t; ++i) {
      // faster way of calculating u0 = x[i]*mp mod DV
      var j = x[i] & 0x7fff;
      var u0 = (j * this.mpl + (((j * this.mph + (x[i] >> 15) * this.mpl) & this.um) << 15)) & x.DM;
      // use am to combine the multiply-shift-add into one call
      j = i + this.m.t;
      x[j] += this.m.am(0, u0, x, i, 0, this.m.t);
      // propagate carry
      while (x[j] >= x.DV) { x[j] -= x.DV; x[++j]++; }
    }
    x.clamp();
    x.drShiftTo(this.m.t, x);
    if (x.compareTo(this.m) >= 0) x.subTo(this.m, x);
  }

  // r = "x^2/R mod m"; x != r
  function montSqrTo(x, r) { x.squareTo(r); this.reduce(r); }

  // r = "xy/R mod m"; x,y != r
  function montMulTo(x, y, r) { x.multiplyTo(y, r); this.reduce(r); }

  Montgomery.prototype.convert = montConvert;
  Montgomery.prototype.revert = montRevert;
  Montgomery.prototype.reduce = montReduce;
  Montgomery.prototype.mulTo = montMulTo;
  Montgomery.prototype.sqrTo = montSqrTo;

  // (protected) true iff this is even
  function bnpIsEven() { return ((this.t > 0) ? (this[0] & 1) : this.s) == 0; }

  // (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
  function bnpExp(e, z) {
    if (e > 0xffffffff || e < 1) return BigInteger.ONE;
    var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e) - 1;
    g.copyTo(r);
    while (--i >= 0) {
      z.sqrTo(r, r2);
      if ((e & (1 << i)) > 0) z.mulTo(r2, g, r);
      else { var t = r; r = r2; r2 = t; }
    }
    return z.revert(r);
  }

  // (public) this^e % m, 0 <= e < 2^32
  function bnModPowInt(e, m) {
    var z;
    if (e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
    return this.exp(e, z);
  }

  // protected
  BigInteger.prototype.copyTo = bnpCopyTo;
  BigInteger.prototype.fromInt = bnpFromInt;
  BigInteger.prototype.fromString = bnpFromString;
  BigInteger.prototype.clamp = bnpClamp;
  BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
  BigInteger.prototype.drShiftTo = bnpDRShiftTo;
  BigInteger.prototype.lShiftTo = bnpLShiftTo;
  BigInteger.prototype.rShiftTo = bnpRShiftTo;
  BigInteger.prototype.subTo = bnpSubTo;
  BigInteger.prototype.multiplyTo = bnpMultiplyTo;
  BigInteger.prototype.squareTo = bnpSquareTo;
  BigInteger.prototype.divRemTo = bnpDivRemTo;
  BigInteger.prototype.invDigit = bnpInvDigit;
  BigInteger.prototype.isEven = bnpIsEven;
  BigInteger.prototype.exp = bnpExp;

  // public
  BigInteger.prototype.toString = bnToString;
  BigInteger.prototype.negate = bnNegate;
  BigInteger.prototype.abs = bnAbs;
  BigInteger.prototype.compareTo = bnCompareTo;
  BigInteger.prototype.bitLength = bnBitLength;
  BigInteger.prototype.mod = bnMod;
  BigInteger.prototype.modPowInt = bnModPowInt;

  // "constants"
  BigInteger.ZERO = nbv(0);
  BigInteger.ONE = nbv(1);

  // Copyright (c) 2005-2009  Tom Wu
  // All Rights Reserved.
  // See "LICENSE" for details.

  // Extended JavaScript BN functions, required for RSA private ops.

  // Version 1.1: new BigInteger("0", 10) returns "proper" zero
  // Version 1.2: square() API, isProbablePrime fix

  // (public)
  function bnClone() { var r = nbi(); this.copyTo(r); return r; }

  // (public) return value as integer
  function bnIntValue() {
    if (this.s < 0) {
      if (this.t == 1) return this[0] - this.DV;
      else if (this.t == 0) return -1;
    }
    else if (this.t == 1) return this[0];
    else if (this.t == 0) return 0;
    // assumes 16 < DB < 32
    return ((this[1] & ((1 << (32 - this.DB)) - 1)) << this.DB) | this[0];
  }

  // (public) return value as byte
  function bnByteValue() { return (this.t == 0) ? this.s : (this[0] << 24) >> 24; }

  // (public) return value as short (assumes DB>=16)
  function bnShortValue() { return (this.t == 0) ? this.s : (this[0] << 16) >> 16; }

  // (protected) return x s.t. r^x < DV
  function bnpChunkSize(r) { return Math.floor(Math.LN2 * this.DB / Math.log(r)); }

  // (public) 0 if this == 0, 1 if this > 0
  function bnSigNum() {
    if (this.s < 0) return -1;
    else if (this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
    else return 1;
  }

  // (protected) convert to radix string
  function bnpToRadix(b) {
    if (b == null) b = 10;
    if (this.signum() == 0 || b < 2 || b > 36) return "0";
    var cs = this.chunkSize(b);
    var a = Math.pow(b, cs);
    var d = nbv(a), y = nbi(), z = nbi(), r = "";
    this.divRemTo(d, y, z);
    while (y.signum() > 0) {
      r = (a + z.intValue()).toString(b).substr(1) + r;
      y.divRemTo(d, y, z);
    }
    return z.intValue().toString(b) + r;
  }

  // (protected) convert from radix string
  function bnpFromRadix(s, b) {
    this.fromInt(0);
    if (b == null) b = 10;
    var cs = this.chunkSize(b);
    var d = Math.pow(b, cs), mi = false, j = 0, w = 0;
    for (var i = 0; i < s.length; ++i) {
      var x = intAt(s, i);
      if (x < 0) {
        if (s.charAt(i) == "-" && this.signum() == 0) mi = true;
        continue;
      }
      w = b * w + x;
      if (++j >= cs) {
        this.dMultiply(d);
        this.dAddOffset(w, 0);
        j = 0;
        w = 0;
      }
    }
    if (j > 0) {
      this.dMultiply(Math.pow(b, j));
      this.dAddOffset(w, 0);
    }
    if (mi) BigInteger.ZERO.subTo(this, this);
  }

  // (protected) alternate constructor
  function bnpFromNumber(a, b, c) {
    if ("number" == typeof b) {
      // new BigInteger(int,int,RNG)
      if (a < 2) this.fromInt(1);
      else {
        this.fromNumber(a, c);
        if (!this.testBit(a - 1))    // force MSB set
          this.bitwiseTo(BigInteger.ONE.shiftLeft(a - 1), op_or, this);
        if (this.isEven()) this.dAddOffset(1, 0); // force odd
        while (!this.isProbablePrime(b)) {
          this.dAddOffset(2, 0);
          if (this.bitLength() > a) this.subTo(BigInteger.ONE.shiftLeft(a - 1), this);
        }
      }
    }
    else {
      // new BigInteger(int,RNG)
      var x = new Array(), t = a & 7;
      x.length = (a >> 3) + 1;
      b.nextBytes(x);
      if (t > 0) x[0] &= ((1 << t) - 1); else x[0] = 0;
      this.fromString(x, 256);
    }
  }

  // (public) convert to bigendian byte array
  function bnToByteArray() {
    var i = this.t, r = new Array();
    r[0] = this.s;
    var p = this.DB - (i * this.DB) % 8, d, k = 0;
    if (i-- > 0) {
      if (p < this.DB && (d = this[i] >> p) != (this.s & this.DM) >> p)
        r[k++] = d | (this.s << (this.DB - p));
      while (i >= 0) {
        if (p < 8) {
          d = (this[i] & ((1 << p) - 1)) << (8 - p);
          d |= this[--i] >> (p += this.DB - 8);
        }
        else {
          d = (this[i] >> (p -= 8)) & 0xff;
          if (p <= 0) { p += this.DB; --i; }
        }
        if ((d & 0x80) != 0) d |= -256;
        if (k == 0 && (this.s & 0x80) != (d & 0x80))++k;
        if (k > 0 || d != this.s) r[k++] = d;
      }
    }
    return r;
  }

  function bnEquals(a) { return (this.compareTo(a) == 0); }
  function bnMin(a) { return (this.compareTo(a) < 0) ? this : a; }
  function bnMax(a) { return (this.compareTo(a) > 0) ? this : a; }

  // (protected) r = this op a (bitwise)
  function bnpBitwiseTo(a, op, r) {
    var i, f, m = Math.min(a.t, this.t);
    for (i = 0; i < m; ++i) r[i] = op(this[i], a[i]);
    if (a.t < this.t) {
      f = a.s & this.DM;
      for (i = m; i < this.t; ++i) r[i] = op(this[i], f);
      r.t = this.t;
    }
    else {
      f = this.s & this.DM;
      for (i = m; i < a.t; ++i) r[i] = op(f, a[i]);
      r.t = a.t;
    }
    r.s = op(this.s, a.s);
    r.clamp();
  }

  // (public) this & a
  function op_and(x, y) { return x & y; }
  function bnAnd(a) { var r = nbi(); this.bitwiseTo(a, op_and, r); return r; }

  // (public) this | a
  function op_or(x, y) { return x | y; }
  function bnOr(a) { var r = nbi(); this.bitwiseTo(a, op_or, r); return r; }

  // (public) this ^ a
  function op_xor(x, y) { return x ^ y; }
  function bnXor(a) { var r = nbi(); this.bitwiseTo(a, op_xor, r); return r; }

  // (public) this & ~a
  function op_andnot(x, y) { return x & ~y; }
  function bnAndNot(a) { var r = nbi(); this.bitwiseTo(a, op_andnot, r); return r; }

  // (public) ~this
  function bnNot() {
    var r = nbi();
    for (var i = 0; i < this.t; ++i) r[i] = this.DM & ~this[i];
    r.t = this.t;
    r.s = ~this.s;
    return r;
  }

  // (public) this << n
  function bnShiftLeft(n) {
    var r = nbi();
    if (n < 0) this.rShiftTo(-n, r); else this.lShiftTo(n, r);
    return r;
  }

  // (public) this >> n
  function bnShiftRight(n) {
    var r = nbi();
    if (n < 0) this.lShiftTo(-n, r); else this.rShiftTo(n, r);
    return r;
  }

  // return index of lowest 1-bit in x, x < 2^31
  function lbit(x) {
    if (x == 0) return -1;
    var r = 0;
    if ((x & 0xffff) == 0) { x >>= 16; r += 16; }
    if ((x & 0xff) == 0) { x >>= 8; r += 8; }
    if ((x & 0xf) == 0) { x >>= 4; r += 4; }
    if ((x & 3) == 0) { x >>= 2; r += 2; }
    if ((x & 1) == 0)++r;
    return r;
  }

  // (public) returns index of lowest 1-bit (or -1 if none)
  function bnGetLowestSetBit() {
    for (var i = 0; i < this.t; ++i)
      if (this[i] != 0) return i * this.DB + lbit(this[i]);
    if (this.s < 0) return this.t * this.DB;
    return -1;
  }

  // return number of 1 bits in x
  function cbit(x) {
    var r = 0;
    while (x != 0) { x &= x - 1; ++r; }
    return r;
  }

  // (public) return number of set bits
  function bnBitCount() {
    var r = 0, x = this.s & this.DM;
    for (var i = 0; i < this.t; ++i) r += cbit(this[i] ^ x);
    return r;
  }

  // (public) true iff nth bit is set
  function bnTestBit(n) {
    var j = Math.floor(n / this.DB);
    if (j >= this.t) return (this.s != 0);
    return ((this[j] & (1 << (n % this.DB))) != 0);
  }

  // (protected) this op (1<<n)
  function bnpChangeBit(n, op) {
    var r = BigInteger.ONE.shiftLeft(n);
    this.bitwiseTo(r, op, r);
    return r;
  }

  // (public) this | (1<<n)
  function bnSetBit(n) { return this.changeBit(n, op_or); }

  // (public) this & ~(1<<n)
  function bnClearBit(n) { return this.changeBit(n, op_andnot); }

  // (public) this ^ (1<<n)
  function bnFlipBit(n) { return this.changeBit(n, op_xor); }

  // (protected) r = this + a
  function bnpAddTo(a, r) {
    var i = 0, c = 0, m = Math.min(a.t, this.t);
    while (i < m) {
      c += this[i] + a[i];
      r[i++] = c & this.DM;
      c >>= this.DB;
    }
    if (a.t < this.t) {
      c += a.s;
      while (i < this.t) {
        c += this[i];
        r[i++] = c & this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while (i < a.t) {
        c += a[i];
        r[i++] = c & this.DM;
        c >>= this.DB;
      }
      c += a.s;
    }
    r.s = (c < 0) ? -1 : 0;
    if (c > 0) r[i++] = c;
    else if (c < -1) r[i++] = this.DV + c;
    r.t = i;
    r.clamp();
  }

  // (public) this + a
  function bnAdd(a) { var r = nbi(); this.addTo(a, r); return r; }

  // (public) this - a
  function bnSubtract(a) { var r = nbi(); this.subTo(a, r); return r; }

  // (public) this * a
  function bnMultiply(a) { var r = nbi(); this.multiplyTo(a, r); return r; }

  // (public) this^2
  function bnSquare() { var r = nbi(); this.squareTo(r); return r; }

  // (public) this / a
  function bnDivide(a) { var r = nbi(); this.divRemTo(a, r, null); return r; }

  // (public) this % a
  function bnRemainder(a) { var r = nbi(); this.divRemTo(a, null, r); return r; }

  // (public) [this/a,this%a]
  function bnDivideAndRemainder(a) {
    var q = nbi(), r = nbi();
    this.divRemTo(a, q, r);
    return new Array(q, r);
  }

  // (protected) this *= n, this >= 0, 1 < n < DV
  function bnpDMultiply(n) {
    this[this.t] = this.am(0, n - 1, this, 0, 0, this.t);
    ++this.t;
    this.clamp();
  }

  // (protected) this += n << w words, this >= 0
  function bnpDAddOffset(n, w) {
    if (n == 0) return;
    while (this.t <= w) this[this.t++] = 0;
    this[w] += n;
    while (this[w] >= this.DV) {
      this[w] -= this.DV;
      if (++w >= this.t) this[this.t++] = 0;
      ++this[w];
    }
  }

  // A "null" reducer
  function NullExp() { }
  function nNop(x) { return x; }
  function nMulTo(x, y, r) { x.multiplyTo(y, r); }
  function nSqrTo(x, r) { x.squareTo(r); }

  NullExp.prototype.convert = nNop;
  NullExp.prototype.revert = nNop;
  NullExp.prototype.mulTo = nMulTo;
  NullExp.prototype.sqrTo = nSqrTo;

  // (public) this^e
  function bnPow(e) { return this.exp(e, new NullExp()); }

  // (protected) r = lower n words of "this * a", a.t <= n
  // "this" should be the larger one if appropriate.
  function bnpMultiplyLowerTo(a, n, r) {
    var i = Math.min(this.t + a.t, n);
    r.s = 0; // assumes a,this >= 0
    r.t = i;
    while (i > 0) r[--i] = 0;
    var j;
    for (j = r.t - this.t; i < j; ++i) r[i + this.t] = this.am(0, a[i], r, i, 0, this.t);
    for (j = Math.min(a.t, n); i < j; ++i) this.am(0, a[i], r, i, 0, n - i);
    r.clamp();
  }

  // (protected) r = "this * a" without lower n words, n > 0
  // "this" should be the larger one if appropriate.
  function bnpMultiplyUpperTo(a, n, r) {
    --n;
    var i = r.t = this.t + a.t - n;
    r.s = 0; // assumes a,this >= 0
    while (--i >= 0) r[i] = 0;
    for (i = Math.max(n - this.t, 0); i < a.t; ++i)
      r[this.t + i - n] = this.am(n - i, a[i], r, 0, 0, this.t + i - n);
    r.clamp();
    r.drShiftTo(1, r);
  }

  // Barrett modular reduction
  function Barrett(m) {
    // setup Barrett
    this.r2 = nbi();
    this.q3 = nbi();
    BigInteger.ONE.dlShiftTo(2 * m.t, this.r2);
    this.mu = this.r2.divide(m);
    this.m = m;
  }

  function barrettConvert(x) {
    if (x.s < 0 || x.t > 2 * this.m.t) return x.mod(this.m);
    else if (x.compareTo(this.m) < 0) return x;
    else { var r = nbi(); x.copyTo(r); this.reduce(r); return r; }
  }

  function barrettRevert(x) { return x; }

  // x = x mod m (HAC 14.42)
  function barrettReduce(x) {
    x.drShiftTo(this.m.t - 1, this.r2);
    if (x.t > this.m.t + 1) { x.t = this.m.t + 1; x.clamp(); }
    this.mu.multiplyUpperTo(this.r2, this.m.t + 1, this.q3);
    this.m.multiplyLowerTo(this.q3, this.m.t + 1, this.r2);
    while (x.compareTo(this.r2) < 0) x.dAddOffset(1, this.m.t + 1);
    x.subTo(this.r2, x);
    while (x.compareTo(this.m) >= 0) x.subTo(this.m, x);
  }

  // r = x^2 mod m; x != r
  function barrettSqrTo(x, r) { x.squareTo(r); this.reduce(r); }

  // r = x*y mod m; x,y != r
  function barrettMulTo(x, y, r) { x.multiplyTo(y, r); this.reduce(r); }

  Barrett.prototype.convert = barrettConvert;
  Barrett.prototype.revert = barrettRevert;
  Barrett.prototype.reduce = barrettReduce;
  Barrett.prototype.mulTo = barrettMulTo;
  Barrett.prototype.sqrTo = barrettSqrTo;

  // (public) this^e % m (HAC 14.85)
  function bnModPow(e, m) {
    var i = e.bitLength(), k, r = nbv(1), z;
    if (i <= 0) return r;
    else if (i < 18) k = 1;
    else if (i < 48) k = 3;
    else if (i < 144) k = 4;
    else if (i < 768) k = 5;
    else k = 6;
    if (i < 8)
      z = new Classic(m);
    else if (m.isEven())
      z = new Barrett(m);
    else
      z = new Montgomery(m);

    // precomputation
    var g = new Array(), n = 3, k1 = k - 1, km = (1 << k) - 1;
    g[1] = z.convert(this);
    if (k > 1) {
      var g2 = nbi();
      z.sqrTo(g[1], g2);
      while (n <= km) {
        g[n] = nbi();
        z.mulTo(g2, g[n - 2], g[n]);
        n += 2;
      }
    }

    var j = e.t - 1, w, is1 = true, r2 = nbi(), t;
    i = nbits(e[j]) - 1;
    while (j >= 0) {
      if (i >= k1) w = (e[j] >> (i - k1)) & km;
      else {
        w = (e[j] & ((1 << (i + 1)) - 1)) << (k1 - i);
        if (j > 0) w |= e[j - 1] >> (this.DB + i - k1);
      }

      n = k;
      while ((w & 1) == 0) { w >>= 1; --n; }
      if ((i -= n) < 0) { i += this.DB; --j; }
      if (is1) {    // ret == 1, don't bother squaring or multiplying it
        g[w].copyTo(r);
        is1 = false;
      }
      else {
        while (n > 1) { z.sqrTo(r, r2); z.sqrTo(r2, r); n -= 2; }
        if (n > 0) z.sqrTo(r, r2); else { t = r; r = r2; r2 = t; }
        z.mulTo(r2, g[w], r);
      }

      while (j >= 0 && (e[j] & (1 << i)) == 0) {
        z.sqrTo(r, r2); t = r; r = r2; r2 = t;
        if (--i < 0) { i = this.DB - 1; --j; }
      }
    }
    return z.revert(r);
  }

  // (public) gcd(this,a) (HAC 14.54)
  function bnGCD(a) {
    var x = (this.s < 0) ? this.negate() : this.clone();
    var y = (a.s < 0) ? a.negate() : a.clone();
    if (x.compareTo(y) < 0) { var t = x; x = y; y = t; }
    var i = x.getLowestSetBit(), g = y.getLowestSetBit();
    if (g < 0) return x;
    if (i < g) g = i;
    if (g > 0) {
      x.rShiftTo(g, x);
      y.rShiftTo(g, y);
    }
    while (x.signum() > 0) {
      if ((i = x.getLowestSetBit()) > 0) x.rShiftTo(i, x);
      if ((i = y.getLowestSetBit()) > 0) y.rShiftTo(i, y);
      if (x.compareTo(y) >= 0) {
        x.subTo(y, x);
        x.rShiftTo(1, x);
      }
      else {
        y.subTo(x, y);
        y.rShiftTo(1, y);
      }
    }
    if (g > 0) y.lShiftTo(g, y);
    return y;
  }

  // (protected) this % n, n < 2^26
  function bnpModInt(n) {
    if (n <= 0) return 0;
    var d = this.DV % n, r = (this.s < 0) ? n - 1 : 0;
    if (this.t > 0)
      if (d == 0) r = this[0] % n;
      else for (var i = this.t - 1; i >= 0; --i) r = (d * r + this[i]) % n;
    return r;
  }

  // (public) 1/this % m (HAC 14.61)
  function bnModInverse(m) {
    var ac = m.isEven();
    if ((this.isEven() && ac) || m.signum() == 0) return BigInteger.ZERO;
    var u = m.clone(), v = this.clone();
    var a = nbv(1), b = nbv(0), c = nbv(0), d = nbv(1);
    while (u.signum() != 0) {
      while (u.isEven()) {
        u.rShiftTo(1, u);
        if (ac) {
          if (!a.isEven() || !b.isEven()) { a.addTo(this, a); b.subTo(m, b); }
          a.rShiftTo(1, a);
        }
        else if (!b.isEven()) b.subTo(m, b);
        b.rShiftTo(1, b);
      }
      while (v.isEven()) {
        v.rShiftTo(1, v);
        if (ac) {
          if (!c.isEven() || !d.isEven()) { c.addTo(this, c); d.subTo(m, d); }
          c.rShiftTo(1, c);
        }
        else if (!d.isEven()) d.subTo(m, d);
        d.rShiftTo(1, d);
      }
      if (u.compareTo(v) >= 0) {
        u.subTo(v, u);
        if (ac) a.subTo(c, a);
        b.subTo(d, b);
      }
      else {
        v.subTo(u, v);
        if (ac) c.subTo(a, c);
        d.subTo(b, d);
      }
    }
    if (v.compareTo(BigInteger.ONE) != 0) return BigInteger.ZERO;
    if (d.compareTo(m) >= 0) return d.subtract(m);
    if (d.signum() < 0) d.addTo(m, d); else return d;
    if (d.signum() < 0) return d.add(m); else return d;
  }

  var lowprimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811, 821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911, 919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997];
  var lplim = (1 << 26) / lowprimes[lowprimes.length - 1];

  // (public) test primality with certainty >= 1-.5^t
  function bnIsProbablePrime(t) {
    var i, x = this.abs();
    if (x.t == 1 && x[0] <= lowprimes[lowprimes.length - 1]) {
      for (i = 0; i < lowprimes.length; ++i)
        if (x[0] == lowprimes[i]) return true;
      return false;
    }
    if (x.isEven()) return false;
    i = 1;
    while (i < lowprimes.length) {
      var m = lowprimes[i], j = i + 1;
      while (j < lowprimes.length && m < lplim) m *= lowprimes[j++];
      m = x.modInt(m);
      while (i < j) if (m % lowprimes[i++] == 0) return false;
    }
    return x.millerRabin(t);
  }

  // (protected) true if probably prime (HAC 4.24, Miller-Rabin)
  function bnpMillerRabin(t) {
    var n1 = this.subtract(BigInteger.ONE);
    var k = n1.getLowestSetBit();
    if (k <= 0) return false;
    var r = n1.shiftRight(k);
    t = (t + 1) >> 1;
    if (t > lowprimes.length) t = lowprimes.length;
    var a = nbi();
    for (var i = 0; i < t; ++i) {
      //Pick bases at random, instead of starting at 2
      a.fromInt(lowprimes[Math.floor(Math.random() * lowprimes.length)]);
      var y = a.modPow(r, this);
      if (y.compareTo(BigInteger.ONE) != 0 && y.compareTo(n1) != 0) {
        var j = 1;
        while (j++ < k && y.compareTo(n1) != 0) {
          y = y.modPowInt(2, this);
          if (y.compareTo(BigInteger.ONE) == 0) return false;
        }
        if (y.compareTo(n1) != 0) return false;
      }
    }
    return true;
  }

  // protected
  BigInteger.prototype.chunkSize = bnpChunkSize;
  BigInteger.prototype.toRadix = bnpToRadix;
  BigInteger.prototype.fromRadix = bnpFromRadix;
  BigInteger.prototype.fromNumber = bnpFromNumber;
  BigInteger.prototype.bitwiseTo = bnpBitwiseTo;
  BigInteger.prototype.changeBit = bnpChangeBit;
  BigInteger.prototype.addTo = bnpAddTo;
  BigInteger.prototype.dMultiply = bnpDMultiply;
  BigInteger.prototype.dAddOffset = bnpDAddOffset;
  BigInteger.prototype.multiplyLowerTo = bnpMultiplyLowerTo;
  BigInteger.prototype.multiplyUpperTo = bnpMultiplyUpperTo;
  BigInteger.prototype.modInt = bnpModInt;
  BigInteger.prototype.millerRabin = bnpMillerRabin;

  // public
  BigInteger.prototype.clone = bnClone;
  BigInteger.prototype.intValue = bnIntValue;
  BigInteger.prototype.byteValue = bnByteValue;
  BigInteger.prototype.shortValue = bnShortValue;
  BigInteger.prototype.signum = bnSigNum;
  BigInteger.prototype.toByteArray = bnToByteArray;
  BigInteger.prototype.equals = bnEquals;
  BigInteger.prototype.min = bnMin;
  BigInteger.prototype.max = bnMax;
  BigInteger.prototype.and = bnAnd;
  BigInteger.prototype.or = bnOr;
  BigInteger.prototype.xor = bnXor;
  BigInteger.prototype.andNot = bnAndNot;
  BigInteger.prototype.not = bnNot;
  BigInteger.prototype.shiftLeft = bnShiftLeft;
  BigInteger.prototype.shiftRight = bnShiftRight;
  BigInteger.prototype.getLowestSetBit = bnGetLowestSetBit;
  BigInteger.prototype.bitCount = bnBitCount;
  BigInteger.prototype.testBit = bnTestBit;
  BigInteger.prototype.setBit = bnSetBit;
  BigInteger.prototype.clearBit = bnClearBit;
  BigInteger.prototype.flipBit = bnFlipBit;
  BigInteger.prototype.add = bnAdd;
  BigInteger.prototype.subtract = bnSubtract;
  BigInteger.prototype.multiply = bnMultiply;
  BigInteger.prototype.divide = bnDivide;
  BigInteger.prototype.remainder = bnRemainder;
  BigInteger.prototype.divideAndRemainder = bnDivideAndRemainder;
  BigInteger.prototype.modPow = bnModPow;
  BigInteger.prototype.modInverse = bnModInverse;
  BigInteger.prototype.pow = bnPow;
  BigInteger.prototype.gcd = bnGCD;
  BigInteger.prototype.isProbablePrime = bnIsProbablePrime;

  // JSBN-specific extension
  BigInteger.prototype.square = bnSquare;

  // Expose the Barrett function
  BigInteger.prototype.Barrett = Barrett

  // BigInteger interfaces not implemented in jsbn:

  // BigInteger(int signum, byte[] magnitude)
  // double doubleValue()
  // float floatValue()
  // int hashCode()
  // long longValue()
  // static BigInteger valueOf(long val)

  // Random number generator - requires a PRNG backend, e.g. prng4.js

  // For best results, put code like
  // <body onClick='rng_seed_time();' onKeyPress='rng_seed_time();'>
  // in your main HTML document.

  var rng_state;
  var rng_pool;
  var rng_pptr;

  // Mix in a 32-bit integer into the pool
  function rng_seed_int(x) {
    rng_pool[rng_pptr++] ^= x & 255;
    rng_pool[rng_pptr++] ^= (x >> 8) & 255;
    rng_pool[rng_pptr++] ^= (x >> 16) & 255;
    rng_pool[rng_pptr++] ^= (x >> 24) & 255;
    if (rng_pptr >= rng_psize) rng_pptr -= rng_psize;
  }

  // Mix in the current time (w/milliseconds) into the pool
  function rng_seed_time() {
    rng_seed_int(new Date().getTime());
  }

  // Initialize the pool with junk if needed.
  if (rng_pool == null) {
    rng_pool = new Array();
    rng_pptr = 0;
    var t;
    if (typeof window !== "undefined" && window.crypto) {
      if (window.crypto.getRandomValues) {
        // Use webcrypto if available
        var ua = new Uint8Array(32);
        window.crypto.getRandomValues(ua);
        for (t = 0; t < 32; ++t)
          rng_pool[rng_pptr++] = ua[t];
      }
      else if (navigator.appName == "Netscape" && navigator.appVersion < "5") {
        // Extract entropy (256 bits) from NS4 RNG if available
        var z = window.crypto.random(32);
        for (t = 0; t < z.length; ++t)
          rng_pool[rng_pptr++] = z.charCodeAt(t) & 255;
      }
    }
    while (rng_pptr < rng_psize) {  // extract some randomness from Math.random()
      t = Math.floor(65536 * Math.random());
      rng_pool[rng_pptr++] = t >>> 8;
      rng_pool[rng_pptr++] = t & 255;
    }
    rng_pptr = 0;
    rng_seed_time();
    //rng_seed_int(window.screenX);
    //rng_seed_int(window.screenY);
  }

  function rng_get_byte() {
    if (rng_state == null) {
      rng_seed_time();
      rng_state = prng_newstate();
      rng_state.init(rng_pool);
      for (rng_pptr = 0; rng_pptr < rng_pool.length; ++rng_pptr)
        rng_pool[rng_pptr] = 0;
      rng_pptr = 0;
      //rng_pool = null;
    }
    // TODO: allow reseeding after first request
    return rng_state.next();
  }

  function rng_get_bytes(ba) {
    var i;
    for (i = 0; i < ba.length; ++i) ba[i] = rng_get_byte();
  }

  function SecureRandom() { }

  SecureRandom.prototype.nextBytes = rng_get_bytes;

  // prng4.js - uses Arcfour as a PRNG

  function Arcfour() {
    this.i = 0;
    this.j = 0;
    this.S = new Array();
  }

  // Initialize arcfour context from key, an array of ints, each from [0..255]
  function ARC4init(key) {
    var i, j, t;
    for (i = 0; i < 256; ++i)
      this.S[i] = i;
    j = 0;
    for (i = 0; i < 256; ++i) {
      j = (j + this.S[i] + key[i % key.length]) & 255;
      t = this.S[i];
      this.S[i] = this.S[j];
      this.S[j] = t;
    }
    this.i = 0;
    this.j = 0;
  }

  function ARC4next() {
    var t;
    this.i = (this.i + 1) & 255;
    this.j = (this.j + this.S[this.i]) & 255;
    t = this.S[this.i];
    this.S[this.i] = this.S[this.j];
    this.S[this.j] = t;
    return this.S[(t + this.S[this.i]) & 255];
  }

  Arcfour.prototype.init = ARC4init;
  Arcfour.prototype.next = ARC4next;

  // Plug in your RNG constructor here
  function prng_newstate() {
    return new Arcfour();
  }

  // Pool size must be a multiple of 4 and greater than 32.
  // An array of bytes the size of the pool will be passed to init()
  var rng_psize = 256;

  return {
    BigInteger: BigInteger,
    SecureRandom: SecureRandom
  };

}).call(this);



function $partial_0_1$prim_95__95_floatToStr(){
    return (function(x1){
        return prim_95__95_floatToStr(x1);
    });
}

function $partial_0_2$prim_95__95_strCons(){
    return (function(x1){
        return (function(x2){
            return prim_95__95_strCons(x1, x2);
        });
    });
}

function $partial_0_1$prim_95__95_toStrBigInt(){
    return (function(x1){
        return prim_95__95_toStrBigInt(x1);
    });
}

function $partial_1_2$Main__get_95_qty_95_int(x1){
    return (function(x2){
        return Main__get_95_qty_95_int(x1, x2);
    });
}

function $partial_0_1$Prelude__Chars__isControl(){
    return (function(x1){
        return Prelude__Chars__isControl(x1);
    });
}

function $partial_0_1$Prelude__Chars__isDigit(){
    return (function(x1){
        return Prelude__Chars__isDigit(x1);
    });
}

function $partial_0_1$Prelude__Chars__isSpace(){
    return (function(x1){
        return Prelude__Chars__isSpace(x1);
    });
}

function $partial_1_2$Main__remove_95_row(x1){
    return (function(x2){
        return Main__remove_95_row(x1, x2);
    });
}

function $partial_2_3$Main__update_95_qty(x1, x2){
    return (function(x3){
        return Main__update_95_qty(x1, x2, x3);
    });
}

function $partial_0_2$Text__Parser__Core___123__42__62__95_0_125_(){
    return (function(x1){
        return (function(x2){
            return Text__Parser__Core___123__42__62__95_0_125_(x1, x2);
        });
    });
}

function $partial_2_3$Text__Parser__Core___123__42__62__95_1_125_(x1, x2){
    return (function(x3){
        return Text__Parser__Core___123__42__62__95_1_125_(x1, x2, x3);
    });
}

function $partial_0_2$Text__Parser__Core___123__60__42__95_2_125_(){
    return (function(x1){
        return (function(x2){
            return Text__Parser__Core___123__60__42__95_2_125_(x1, x2);
        });
    });
}

function $partial_1_2$Language__JSON__Parser___123_array_95_9_125_(x1){
    return (function(x2){
        return Language__JSON__Parser___123_array_95_9_125_(x1, x2);
    });
}

function $partial_0_1$Language__JSON__Parser___123_array_95_11_125_(){
    return (function(x1){
        return Language__JSON__Parser___123_array_95_11_125_(x1);
    });
}

function $partial_0_1$Language__JSON__Parser___123_array_95_12_125_(){
    return (function(x1){
        return Language__JSON__Parser___123_array_95_12_125_(x1);
    });
}

function $partial_0_1$Language__JSON__Parser___123_array_95_13_125_(){
    return (function(x1){
        return Language__JSON__Parser___123_array_95_13_125_(x1);
    });
}

function $partial_0_2$Prelude__Bits___123_b16ToHexString_95_15_125_(){
    return (function(x1){
        return (function(x2){
            return Prelude__Bits___123_b16ToHexString_95_15_125_(x1, x2);
        });
    });
}

function $partial_0_1$Language__JSON__Parser___123_boolean_95_16_125_(){
    return (function(x1){
        return Language__JSON__Parser___123_boolean_95_16_125_(x1);
    });
}

function $partial_1_2$Text__Lexer___123_exact_95_22_125_(x1){
    return (function(x2){
        return Text__Lexer___123_exact_95_22_125_(x1, x2);
    });
}

function $partial_0_1$Text__Lexer___123_exact_95_23_125_(){
    return (function(x1){
        return Text__Lexer___123_exact_95_23_125_(x1);
    });
}

function $partial_0_4$Exchange___123_interpret1_95_24_125_(){
    return (function(x1){
        return (function(x2){
            return (function(x3){
                return (function(x4){
                    return Exchange___123_interpret1_95_24_125_(x1, x2, x3, x4);
                });
            });
        });
    });
}

function $partial_0_1$Exchange___123_interpret1_95_26_125_(){
    return (function(x1){
        return Exchange___123_interpret1_95_26_125_(x1);
    });
}

function $partial_0_2$Exchange___123_interpret1_95_28_125_(){
    return (function(x1){
        return (function(x2){
            return Exchange___123_interpret1_95_28_125_(x1, x2);
        });
    });
}

function $partial_2_3$Exchange___123_interpret1_95_29_125_(x1, x2){
    return (function(x3){
        return Exchange___123_interpret1_95_29_125_(x1, x2, x3);
    });
}

function $partial_1_3$Exchange___123_interpret1_95_30_125_(x1){
    return (function(x2){
        return (function(x3){
            return Exchange___123_interpret1_95_30_125_(x1, x2, x3);
        });
    });
}

function $partial_2_3$Exchange___123_interpret1_95_31_125_(x1, x2){
    return (function(x3){
        return Exchange___123_interpret1_95_31_125_(x1, x2, x3);
    });
}

function $partial_1_2$Exchange___123_interpret1_95_32_125_(x1){
    return (function(x2){
        return Exchange___123_interpret1_95_32_125_(x1, x2);
    });
}

function $partial_0_1$Exchange___123_interpret1_95_33_125_(){
    return (function(x1){
        return Exchange___123_interpret1_95_33_125_(x1);
    });
}

function $partial_0_1$Language__JSON__Parser___123_json_95_35_125_(){
    return (function(x1){
        return Language__JSON__Parser___123_json_95_35_125_(x1);
    });
}

function $partial_0_1$Language__JSON__Parser___123_json_95_37_125_(){
    return (function(x1){
        return Language__JSON__Parser___123_json_95_37_125_(x1);
    });
}

function $partial_0_1$Language__JSON__Parser___123_json_95_38_125_(){
    return (function(x1){
        return Language__JSON__Parser___123_json_95_38_125_(x1);
    });
}

function $partial_0_1$Language__JSON__String__Lexer___123_jsonStringTokenMap_95_39_125_(){
    return (function(x1){
        return Language__JSON__String__Lexer___123_jsonStringTokenMap_95_39_125_(x1);
    });
}

function $partial_0_1$Language__JSON__Lexer___123_jsonTokenMap_95_41_125_(){
    return (function(x1){
        return Language__JSON__Lexer___123_jsonTokenMap_95_41_125_(x1);
    });
}

function $partial_0_1$Language__JSON__Lexer___123_jsonTokenMap_95_42_125_(){
    return (function(x1){
        return Language__JSON__Lexer___123_jsonTokenMap_95_42_125_(x1);
    });
}

function $partial_0_1$Language__JSON__Lexer___123_jsonTokenMap_95_43_125_(){
    return (function(x1){
        return Language__JSON__Lexer___123_jsonTokenMap_95_43_125_(x1);
    });
}

function $partial_0_1$Language__JSON__Lexer___123_jsonTokenMap_95_44_125_(){
    return (function(x1){
        return Language__JSON__Lexer___123_jsonTokenMap_95_44_125_(x1);
    });
}

function $partial_0_1$Language__JSON__Lexer___123_jsonTokenMap_95_45_125_(){
    return (function(x1){
        return Language__JSON__Lexer___123_jsonTokenMap_95_45_125_(x1);
    });
}

function $partial_0_1$Language__JSON__Lexer___123_jsonTokenMap_95_46_125_(){
    return (function(x1){
        return Language__JSON__Lexer___123_jsonTokenMap_95_46_125_(x1);
    });
}

function $partial_0_2$Exchange___123_key_95_empty_95_47_125_(){
    return (function(x1){
        return (function(x2){
            return Exchange___123_key_95_empty_95_47_125_(x1, x2);
        });
    });
}

function $partial_0_2$Exchange___123_key_95_empty_95_48_125_(){
    return (function(x1){
        return (function(x2){
            return Exchange___123_key_95_empty_95_48_125_(x1, x2);
        });
    });
}

function $partial_0_2$Exchange___123_key_95_empty_95_49_125_(){
    return (function(x1){
        return (function(x2){
            return Exchange___123_key_95_empty_95_49_125_(x1, x2);
        });
    });
}

function $partial_0_1$Language__JSON__String__Lexer___123_legalChar_95_51_125_(){
    return (function(x1){
        return Language__JSON__String__Lexer___123_legalChar_95_51_125_(x1);
    });
}

function $partial_0_1$Language__JSON__String__Lexer___123_legalChar_95_52_125_(){
    return (function(x1){
        return Language__JSON__String__Lexer___123_legalChar_95_52_125_(x1);
    });
}

function $partial_0_1$Language__JSON__Lexer___123_lexJSON_95_53_125_(){
    return (function(x1){
        return Language__JSON__Lexer___123_lexJSON_95_53_125_(x1);
    });
}

function $partial_1_2$Text__Lexer___123_like_95_55_125_(x1){
    return (function(x2){
        return Text__Lexer___123_like_95_55_125_(x1, x2);
    });
}

function $partial_2_3$Main___123_line_95_list2io_95_56_125_(x1, x2){
    return (function(x3){
        return Main___123_line_95_list2io_95_56_125_(x1, x2, x3);
    });
}

function $partial_0_1$Main___123_main_95_57_125_(){
    return (function(x1){
        return Main___123_main_95_57_125_(x1);
    });
}

function $partial_0_1$Language__JSON__Lexer___123_numberLit_95_62_125_(){
    return (function(x1){
        return Language__JSON__Lexer___123_numberLit_95_62_125_(x1);
    });
}

function $partial_0_1$Language__JSON__Lexer___123_numberLit_95_63_125_(){
    return (function(x1){
        return Language__JSON__Lexer___123_numberLit_95_63_125_(x1);
    });
}

function $partial_0_1$Language__JSON__Lexer___123_numberLit_95_65_125_(){
    return (function(x1){
        return Language__JSON__Lexer___123_numberLit_95_65_125_(x1);
    });
}

function $partial_0_1$Language__JSON__Lexer___123_numberLit_95_69_125_(){
    return (function(x1){
        return Language__JSON__Lexer___123_numberLit_95_69_125_(x1);
    });
}

function $partial_1_2$Language__JSON__Parser___123_object_95_74_125_(x1){
    return (function(x2){
        return Language__JSON__Parser___123_object_95_74_125_(x1, x2);
    });
}

function $partial_0_1$Language__JSON__Parser___123_object_95_76_125_(){
    return (function(x1){
        return Language__JSON__Parser___123_object_95_76_125_(x1);
    });
}

function $partial_0_1$Language__JSON__Parser___123_object_95_77_125_(){
    return (function(x1){
        return Language__JSON__Parser___123_object_95_77_125_(x1);
    });
}

function $partial_0_1$Language__JSON__Parser___123_object_95_78_125_(){
    return (function(x1){
        return Language__JSON__Parser___123_object_95_78_125_(x1);
    });
}

function $partial_0_1$Language__JSON__Parser___123_parseJSON_95_80_125_(){
    return (function(x1){
        return Language__JSON__Parser___123_parseJSON_95_80_125_(x1);
    });
}

function $partial_1_2$Language__JSON__String__Parser___123_quotedString_95_90_125_(x1){
    return (function(x2){
        return Language__JSON__String__Parser___123_quotedString_95_90_125_(x1, x2);
    });
}

function $partial_0_1$Language__JSON__String__Parser___123_quotedString_95_91_125_(){
    return (function(x1){
        return Language__JSON__String__Parser___123_quotedString_95_91_125_(x1);
    });
}

function $partial_2_3$Text__Lexer___123_range_95_93_125_(x1, x2){
    return (function(x3){
        return Text__Lexer___123_range_95_93_125_(x1, x2, x3);
    });
}

function $partial_0_1$Language__JSON__Parser___123_rawString_95_94_125_(){
    return (function(x1){
        return Language__JSON__Parser___123_rawString_95_94_125_(x1);
    });
}

function $partial_0_2$Text__Parser___123_sepBy1_95_96_125_(){
    return (function(x1){
        return (function(x2){
            return Text__Parser___123_sepBy1_95_96_125_(x1, x2);
        });
    });
}

function $partial_3_4$Text__Parser___123_sepBy1_95_98_125_(x1, x2, x3){
    return (function(x4){
        return Text__Parser___123_sepBy1_95_98_125_(x1, x2, x3, x4);
    });
}

function $partial_0_2$Language__JSON__Data___123_showString_95_99_125_(){
    return (function(x1){
        return (function(x2){
            return Language__JSON__Data___123_showString_95_99_125_(x1, x2);
        });
    });
}

function $partial_0_1$Language__JSON__String__Lexer___123_simpleEscape_95_101_125_(){
    return (function(x1){
        return Language__JSON__String__Lexer___123_simpleEscape_95_101_125_(x1);
    });
}

function $partial_1_2$Text__Parser___123_some_95_103_125_(x1){
    return (function(x2){
        return Text__Parser___123_some_95_103_125_(x1, x2);
    });
}

function $partial_1_2$Text__Parser___123_some_95_104_125_(x1){
    return (function(x2){
        return Text__Parser___123_some_95_104_125_(x1, x2);
    });
}

function $partial_2_3$Printf___123_toFunction_95_107_125_(x1, x2){
    return (function(x3){
        return Printf___123_toFunction_95_107_125_(x1, x2, x3);
    });
}

function $partial_2_3$Printf___123_toFunction_95_108_125_(x1, x2){
    return (function(x3){
        return Printf___123_toFunction_95_108_125_(x1, x2, x3);
    });
}

function $partial_0_1$Data__SortedMap___123_toList_95_109_125_(){
    return (function(x1){
        return Data__SortedMap___123_toList_95_109_125_(x1);
    });
}

function $partial_1_2$Text__Lexer___123_toTokenMap_95_110_125_(x1){
    return (function(x2){
        return Text__Lexer___123_toTokenMap_95_110_125_(x1, x2);
    });
}

function $partial_0_1$Text__Lexer___123_toTokenMap_95_111_125_(){
    return (function(x1){
        return Text__Lexer___123_toTokenMap_95_111_125_(x1);
    });
}

function $partial_0_1$Language__JSON__String__Lexer___123_unicodeEscape_95_113_125_(){
    return (function(x1){
        return Language__JSON__String__Lexer___123_unicodeEscape_95_113_125_(x1);
    });
}

function $partial_0_1$Language__JSON__String__Lexer___123_unicodeEscape_95_114_125_(){
    return (function(x1){
        return Language__JSON__String__Lexer___123_unicodeEscape_95_114_125_(x1);
    });
}

function $partial_1_2$Prelude__Functor___123_Text__Parser__Core___64_Prelude__Functor__Functor_36_Grammar_32_tok_32_c_58__33_map_58_0_95_lam_95_129_125_(x1){
    return (function(x2){
        return Prelude__Functor___123_Text__Parser__Core___64_Prelude__Functor__Functor_36_Grammar_32_tok_32_c_58__33_map_58_0_95_lam_95_129_125_(x1, x2);
    });
}

function $partial_9_10$Prelude__Functor___123_Text__Parser__Core___64_Prelude__Functor__Functor_36_Grammar_32_tok_32_c_58__33_map_58_0_95_lam_95_131_125_(x1, x2, x3, x4, x5, x6, x7, x8, x9){
    return (function(x10){
        return Prelude__Functor___123_Text__Parser__Core___64_Prelude__Functor__Functor_36_Grammar_32_tok_32_c_58__33_map_58_0_95_lam_95_131_125_(x1, x2, x3, x4, x5, x6, x7, x8, x9, x10);
    });
}

function $partial_3_4$Prelude__Functor___123_Text__Parser__Core___64_Prelude__Functor__Functor_36_Grammar_32_tok_32_c_58__33_map_58_0_95_lam_95_134_125_(x1, x2, x3){
    return (function(x4){
        return Prelude__Functor___123_Text__Parser__Core___64_Prelude__Functor__Functor_36_Grammar_32_tok_32_c_58__33_map_58_0_95_lam_95_134_125_(x1, x2, x3, x4);
    });
}

function $partial_2_3$Prelude__Functor___123_Text__Parser__Core___64_Prelude__Functor__Functor_36_Grammar_32_tok_32_c_58__33_map_58_0_95_lam_95_135_125_(x1, x2){
    return (function(x3){
        return Prelude__Functor___123_Text__Parser__Core___64_Prelude__Functor__Functor_36_Grammar_32_tok_32_c_58__33_map_58_0_95_lam_95_135_125_(x1, x2, x3);
    });
}

function $partial_1_2$Prelude__Monad___123_Control__Monad__State___64_Prelude__Monad__Monad_36_StateT_32_stateType_32_m_58__33__62__62__61__58_0_95_lam_95_138_125_(x1){
    return (function(x2){
        return Prelude__Monad___123_Control__Monad__State___64_Prelude__Monad__Monad_36_StateT_32_stateType_32_m_58__33__62__62__61__58_0_95_lam_95_138_125_(x1, x2);
    });
}

function $partial_7_8$Prelude__Monad__Control__Monad__State___64_Prelude__Monad__Monad_36_StateT_32_stateType_32_m_58__33__62__62__61__58_0(x1, x2, x3, x4, x5, x6, x7){
    return (function(x8){
        return Prelude__Monad__Control__Monad__State___64_Prelude__Monad__Monad_36_StateT_32_stateType_32_m_58__33__62__62__61__58_0(x1, x2, x3, x4, x5, x6, x7, x8);
    });
}

function $partial_0_2$$_6_PE_95_insertFrom_95_2a38cce8(){
    return (function(x1){
        return (function(x2){
            return $_6_PE_95_insertFrom_95_2a38cce8(x1, x2);
        });
    });
}

function $partial_1_2$$_7_PE_95_match_95_3b7ca742(x1){
    return (function(x2){
        return $_7_PE_95_match_95_3b7ca742(x1, x2);
    });
}

function $partial_1_2$$_8_PE_95_match_95_44e5df34(x1){
    return (function(x2){
        return $_8_PE_95_match_95_44e5df34(x1, x2);
    });
}

function $partial_2_4$$_117_Data__SortedMap__mergeWith_58_inserted_58_0_95_lam(x1, x2){
    return (function(x3){
        return (function(x4){
            return $_117_Data__SortedMap__mergeWith_58_inserted_58_0_95_lam(x1, x2, x3, x4);
        });
    });
}

function $partial_1_2$$_118_Language__JSON__Parser__object_58_properties_58_0_95_lam(x1){
    return (function(x2){
        return $_118_Language__JSON__Parser__object_58_properties_58_0_95_lam(x1, x2);
    });
}

function $partial_1_2$$_120_Language__JSON__Parser__object_58_properties_58_0_95_lam(x1){
    return (function(x2){
        return $_120_Language__JSON__Parser__object_58_properties_58_0_95_lam(x1, x2);
    });
}

function $partial_0_1$$_122_Language__JSON__Parser__object_58_properties_58_0_95_lam(){
    return (function(x1){
        return $_122_Language__JSON__Parser__object_58_properties_58_0_95_lam(x1);
    });
}

function $partial_0_1$$_124_Text__Lexer__Core__tokenise_58_getCols_58_0_95_lam(){
    return (function(x1){
        return $_124_Text__Lexer__Core__tokenise_58_getCols_58_0_95_lam(x1);
    });
}

function $partial_0_1$$_125_Text__Lexer__Core__tokenise_58_getFirstToken_58_0_95_lam(){
    return (function(x1){
        return $_125_Text__Lexer__Core__tokenise_58_getFirstToken_58_0_95_lam(x1);
    });
}

function $partial_2_3$$_126_Data__SortedMap__treeToList_58_treeToList_39__58_0_95_lam(x1, x2){
    return (function(x3){
        return $_126_Data__SortedMap__treeToList_58_treeToList_39__58_0_95_lam(x1, x2, x3);
    });
}

function $partial_3_4$$_128_Data__SortedMap__treeToList_58_treeToList_39__58_0_95_lam(x1, x2, x3){
    return (function(x4){
        return $_128_Data__SortedMap__treeToList_58_treeToList_39__58_0_95_lam(x1, x2, x3, x4);
    });
}

function $partial_4_8$Prelude__WellFounded__sizeAccessible_58_acc_58_0(x1, x2, x3, x4){
    return (function(x5){
        return (function(x6){
            return (function(x7){
                return (function(x8){
                    return Prelude__WellFounded__sizeAccessible_58_acc_58_0(x1, x2, x3, x4, x5, x6, x7, x8);
                });
            });
        });
    });
}

function $partial_6_8$Prelude__WellFounded__sizeAccessible_58_acc_58_0(x1, x2, x3, x4, x5, x6){
    return (function(x7){
        return (function(x8){
            return Prelude__WellFounded__sizeAccessible_58_acc_58_0(x1, x2, x3, x4, x5, x6, x7, x8);
        });
    });
}

const $HC_0_0$MkUnit = ({type: 0});
const $HC_0_0$TheWorld = ({type: 0});
function $HC_2_1$Prelude__List___58__58_($1, $2){
    this.type = 1;
    this.$1 = $1;
    this.$2 = $2;
}

function $HC_2_6$Text__Lexer__Core__Alt($1, $2){
    this.type = 6;
    this.$1 = $1;
    this.$2 = $2;
}

function $HC_4_8$Text__Parser__Core__Alt($1, $2, $3, $4){
    this.type = 8;
    this.$1 = $1;
    this.$2 = $2;
    this.$3 = $3;
    this.$4 = $4;
}

function $HC_3_1$Data__SortedMap__Branch2($1, $2, $3){
    this.type = 1;
    this.$1 = $1;
    this.$2 = $2;
    this.$3 = $3;
}

function $HC_5_2$Data__SortedMap__Branch3($1, $2, $3, $4, $5){
    this.type = 2;
    this.$1 = $1;
    this.$2 = $2;
    this.$3 = $3;
    this.$4 = $4;
    this.$5 = $5;
}

const $HC_0_1$Language__JSON__Tokens__Close = ({type: 1});
const $HC_0_1$Language__JSON__Tokens__Colon = ({type: 1});
const $HC_0_0$Language__JSON__Tokens__Comma = ({type: 0});
const $HC_0_5$Text__Parser__Core__Commit = ({type: 5});
function $HC_1_3$Language__JSON__Tokens__Curly($1){
    this.type = 3;
    this.$1 = $1;
}

const $HC_0_3$Text__Parser__Core__EOF = ({type: 3});
const $HC_0_0$Text__Lexer__Core__Empty = ({type: 0});
function $HC_1_0$Text__Parser__Core__Empty($1){
    this.type = 0;
    this.$1 = $1;
}

function $HC_1_0$Data__SortedMap__Empty($1){
    this.type = 0;
    this.$1 = $1;
}

function $HC_2_1$Text__Parser__Core__EmptyRes($1, $2){
    this.type = 1;
    this.$1 = $1;
    this.$2 = $2;
}

const $HC_0_0$Text__Parser__Core__Error = ({type: 0});
const $HC_0_3$Printf__FEnd = ({type: 3});
function $HC_1_0$Printf__FInt($1){
    this.type = 0;
    this.$1 = $1;
}

function $HC_2_2$Printf__FOther($1, $2){
    this.type = 2;
    this.$1 = $1;
    this.$2 = $2;
}

function $HC_1_1$Printf__FString($1){
    this.type = 1;
    this.$1 = $1;
}

const $HC_0_1$Text__Lexer__Core__Fail = ({type: 1});
const $HC_0_4$Text__Parser__Core__Fail = ({type: 4});
function $HC_1_0$Text__Parser__Core__Failure($1){
    this.type = 0;
    this.$1 = $1;
}

function $HC_1_4$Language__JSON__Data__JArray($1){
    this.type = 4;
    this.$1 = $1;
}

function $HC_1_1$Language__JSON__Data__JBoolean($1){
    this.type = 1;
    this.$1 = $1;
}

const $HC_0_0$Language__JSON__Data__JNull = ({type: 0});
function $HC_1_2$Language__JSON__Data__JNumber($1){
    this.type = 2;
    this.$1 = $1;
}

function $HC_1_5$Language__JSON__Data__JObject($1){
    this.type = 5;
    this.$1 = $1;
}

const $HC_0_1$Language__JSON__String__Tokens__JSTChar = ({type: 1});
const $HC_0_0$Language__JSON__String__Tokens__JSTQuote = ({type: 0});
const $HC_0_2$Language__JSON__String__Tokens__JSTSimpleEscape = ({type: 2});
const $HC_0_3$Language__JSON__String__Tokens__JSTUnicodeEscape = ({type: 3});
function $HC_1_3$Language__JSON__Data__JString($1){
    this.type = 3;
    this.$1 = $1;
}

const $HC_0_0$Language__JSON__Tokens__JTBoolean = ({type: 0});
const $HC_0_5$Language__JSON__Tokens__JTIgnore = ({type: 5});
const $HC_0_3$Language__JSON__Tokens__JTNull = ({type: 3});
const $HC_0_1$Language__JSON__Tokens__JTNumber = ({type: 1});
function $HC_1_4$Language__JSON__Tokens__JTPunct($1){
    this.type = 4;
    this.$1 = $1;
}

const $HC_0_2$Language__JSON__Tokens__JTString = ({type: 2});
function $HC_1_1$Prelude__Maybe__Just($1){
    this.type = 1;
    this.$1 = $1;
}

const $HC_0_1$Prelude__Nat__LTESucc = ({type: 1});
const $HC_0_0$Prelude__Nat__LTEZero = ({type: 0});
function $HC_2_0$Data__SortedMap__Leaf($1, $2){
    this.type = 0;
    this.$1 = $1;
    this.$2 = $2;
}

function $HC_1_0$Prelude__Either__Left($1){
    this.type = 0;
    this.$1 = $1;
}

function $HC_2_2$Text__Lexer__Core__Lookahead($1, $2){
    this.type = 2;
    this.$1 = $1;
    this.$2 = $2;
}

function $HC_2_1$Data__SortedMap__M($1, $2){
    this.type = 1;
    this.$1 = $1;
    this.$2 = $2;
}

function $HC_2_0$Exchange__MkOrderLine($1, $2){
    this.type = 0;
    this.$1 = $1;
    this.$2 = $2;
}

function $HC_6_0$Exchange__MkOrderLineKey($1, $2, $3, $4, $5, $6){
    this.type = 0;
    this.$1 = $1;
    this.$2 = $2;
    this.$3 = $3;
    this.$4 = $4;
    this.$5 = $5;
    this.$6 = $6;
}

function $HC_2_0$Builtins__MkPair($1, $2){
    this.type = 0;
    this.$1 = $1;
    this.$2 = $2;
}

function $HC_2_0$Text__Lexer__Core__MkStrLen($1, $2){
    this.type = 0;
    this.$1 = $1;
    this.$2 = $2;
}

const $HC_0_0$Prelude__List__Nil = ({type: 0});
const $HC_0_1$Prelude__Basics__No = ({type: 1});
function $HC_4_2$Text__Parser__Core__NonEmptyRes($1, $2, $3, $4){
    this.type = 2;
    this.$1 = $1;
    this.$2 = $2;
    this.$3 = $3;
    this.$4 = $4;
}

const $HC_0_0$Prelude__Maybe__Nothing = ({type: 0});
const $HC_0_0$Prelude__Show__Open = ({type: 0});
const $HC_0_0$Language__JSON__Tokens__Open = ({type: 0});
function $HC_1_3$Text__Lexer__Core__Pred($1){
    this.type = 3;
    this.$1 = $1;
}

function $HC_2_0$Text__Quantity__Qty($1, $2){
    this.type = 0;
    this.$1 = $1;
    this.$2 = $2;
}

function $HC_1_1$Prelude__Either__Right($1){
    this.type = 1;
    this.$1 = $1;
}

function $HC_2_4$Text__Lexer__Core__SeqEat($1, $2){
    this.type = 4;
    this.$1 = $1;
    this.$2 = $2;
}

function $HC_3_6$Text__Parser__Core__SeqEat($1, $2, $3){
    this.type = 6;
    this.$1 = $1;
    this.$2 = $2;
    this.$3 = $3;
}

function $HC_2_5$Text__Lexer__Core__SeqEmpty($1, $2){
    this.type = 5;
    this.$1 = $1;
    this.$2 = $2;
}

function $HC_4_7$Text__Parser__Core__SeqEmpty($1, $2, $3, $4){
    this.type = 7;
    this.$1 = $1;
    this.$2 = $2;
    this.$3 = $3;
    this.$4 = $4;
}

function $HC_1_2$Language__JSON__Tokens__Square($1){
    this.type = 2;
    this.$1 = $1;
}

function $HC_2_1$Prelude__Strings__StrCons($1, $2){
    this.type = 1;
    this.$1 = $1;
    this.$2 = $2;
}

const $HC_0_0$Prelude__Strings__StrNil = ({type: 0});
function $HC_1_1$Text__Parser__Core__Terminal($1){
    this.type = 1;
    this.$1 = $1;
}

function $HC_2_0$Text__Token__Tok($1, $2){
    this.type = 0;
    this.$1 = $1;
    this.$2 = $2;
}

function $HC_2_0$Exchange__Tt($1, $2){
    this.type = 0;
    this.$1 = $1;
    this.$2 = $2;
}

const $HC_0_0$Prelude__Basics__Yes = ({type: 0});
function $HC_3_0$Prelude__Interfaces__Ord_95_ictor($1, $2, $3){
    this.type = 0;
    this.$1 = $1;
    this.$2 = $2;
    this.$3 = $3;
}

// PE_elemBy_3a7ca737

function PE_95_elemBy_95_3a7ca737($_0_arg, $_1_arg){
    for(;;) {
        
        if(($_1_arg.type === 1)) {
            
            if((((($_0_arg === $_1_arg.$1)) ? 1|0 : 0|0) === 0)) {
                $_0_arg = $_0_arg;
                $_1_arg = $_1_arg.$2;
            } else {
                return true;
            }
        } else {
            return false;
        }
    }
}

// PE_insertFrom_2a38cce8

function PE_95_insertFrom_95_2a38cce8($_0_arg, $_1_arg, $_2_arg, $_3_arg){
    return Prelude__Foldable__Prelude__List___64_Prelude__Foldable__Foldable_36_List_58__33_foldl_58_0(null, null, $partial_0_2$$_6_PE_95_insertFrom_95_2a38cce8(), $_3_arg, $_2_arg);
}

// PE_match_3b7ca742

function PE_95_match_95_3b7ca742($_0_arg){
    return new $HC_1_1$Text__Parser__Core__Terminal($partial_1_2$$_7_PE_95_match_95_3b7ca742($_0_arg));
}

// PE_match_44e5df34

function PE_95_match_95_44e5df34($_0_arg){
    return new $HC_1_1$Text__Parser__Core__Terminal($partial_1_2$$_8_PE_95_match_95_44e5df34($_0_arg));
}

// io_bind

function io_95_bind($_0_arg, $_1_arg, $_2_arg, $_3_arg, $_4_k, $_5_w){
    return $_4_k($_3_arg($_5_w))($_5_w);
}

// prim__floatToStr

function prim_95__95_floatToStr($_0_arg){
    return (''+($_0_arg));
}

// prim__strCons

function prim_95__95_strCons($_0_arg, $_1_arg){
    return (($_0_arg)+($_1_arg));
}

// prim__toStrBigInt

function prim_95__95_toStrBigInt($_0_arg){
    return (($_0_arg).toString());
}

// Text.Parser.Core.*>

function Text__Parser__Core___42__62_($_0_arg, $_1_arg, $_2_arg, $_3_arg, $_4_arg, $_5_arg, $_6_arg){
    return new $HC_4_7$Text__Parser__Core__SeqEmpty($_2_arg, $_1_arg, Prelude__Functor__Text__Parser__Core___64_Prelude__Functor__Functor_36_Grammar_32_tok_32_c_58__33_map_58_0(null, $_2_arg, null, null, $partial_0_2$Text__Parser__Core___123__42__62__95_0_125_(), $_5_arg), $partial_2_3$Text__Parser__Core___123__42__62__95_1_125_($_1_arg, $_6_arg));
}

// Prelude.List.++

function Prelude__List___43__43_($_0_arg, $_1_arg, $_2_arg){
    
    if(($_1_arg.type === 1)) {
        return new $HC_2_1$Prelude__List___58__58_($_1_arg.$1, Prelude__List___43__43_(null, $_1_arg.$2, $_2_arg));
    } else {
        return $_2_arg;
    }
}

// Text.Parser.Core.<*

function Text__Parser__Core___60__42_($_0_arg, $_1_arg, $_2_arg, $_3_arg, $_4_arg, $_5_arg, $_6_arg){
    return new $HC_4_7$Text__Parser__Core__SeqEmpty($_2_arg, $_1_arg, Prelude__Functor__Text__Parser__Core___64_Prelude__Functor__Functor_36_Grammar_32_tok_32_c_58__33_map_58_0(null, $_2_arg, null, null, $partial_0_2$Text__Parser__Core___123__60__42__95_2_125_(), $_5_arg), $partial_2_3$Text__Parser__Core___123__42__62__95_1_125_($_1_arg, $_6_arg));
}

// Language.JSON.Parser.array

function Language__JSON__Parser__array(){
    return new $HC_3_6$Text__Parser__Core__SeqEat(true, PE_95_match_95_44e5df34(new $HC_1_4$Language__JSON__Tokens__JTPunct(new $HC_1_2$Language__JSON__Tokens__Square($HC_0_0$Language__JSON__Tokens__Open))), new $JSRTS.Lazy((function(){
        return (function(){
            return Language__JSON__Parser___123_array_95_14_125_();
        })();
    })));
}

// Prelude.Bits.b16ToHexString

function Prelude__Bits__b16ToHexString($_0_arg){
    return Prelude__Foldable__Prelude__List___64_Prelude__Foldable__Foldable_36_List_58__33_foldr_58_0(null, null, $partial_0_2$Prelude__Bits___123_b16ToHexString_95_15_125_(), "", new $HC_2_1$Prelude__List___58__58_((((($_0_arg) >>> ((8 & 0xFFFF)))) & 0xFF), new $HC_2_1$Prelude__List___58__58_((($_0_arg) & 0xFF), $HC_0_0$Prelude__List__Nil)));
}

// Prelude.Bits.b8ToHexString

function Prelude__Bits__b8ToHexString($_0_arg){
    return Prelude__Foldable__Prelude__List___64_Prelude__Foldable__Foldable_36_List_58__33_foldr_58_0(null, null, $partial_0_2$prim_95__95_strCons(), "", new $HC_2_1$Prelude__List___58__58_(Prelude__Bits__b8ToHexString_58_getDigit_58_0(null, (((($_0_arg) >>> ((4 & 0xFF)))) & ((15 & 0xFF)))), new $HC_2_1$Prelude__List___58__58_(Prelude__Bits__b8ToHexString_58_getDigit_58_0(null, (($_0_arg) & ((15 & 0xFF)))), $HC_0_0$Prelude__List__Nil)));
}

// Main.calc_sha1

function Main__calc_95_sha1($_0_x, $_1_w){
    return (calc_sha1(($_0_x)));
}

// Main.calc_sha256

function Main__calc_95_sha256($_0_x, $_1_w){
    return (calc_sha256(($_0_x)));
}

// Language.JSON.String.Tokens.charValue

function Language__JSON__String__Tokens__charValue($_0_arg){
    let $cg$1 = null;
    if((((($_0_arg == "")) ? 1|0 : 0|0) === 0)) {
        $cg$1 = true;
    } else {
        $cg$1 = false;
    }
    
    
    if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$1, true).type === 1)) {
        return "\x00";
    } else {
        return $_0_arg[0];
    }
}

// Prelude.Chars.chr

function Prelude__Chars__chr($_0_arg){
    let $cg$1 = null;
    if((((($_0_arg >= 0)) ? 1|0 : 0|0) === 0)) {
        $cg$1 = false;
    } else {
        $cg$1 = ($_0_arg < 1114112);
    }
    
    
    if($cg$1) {
        return String.fromCharCode($_0_arg);
    } else {
        return "\x00";
    }
}

// Text.Lexer.Core.concatMap

function Text__Lexer__Core__concatMap($_0_arg, $_1_arg, $_2_arg, $_3_arg){
    
    if(($_3_arg.type === 1)) {
        return new $HC_2_5$Text__Lexer__Core__SeqEmpty($_2_arg($_3_arg.$1), Text__Lexer__Core__concatMap(null, null, $_2_arg, $_3_arg.$2));
    } else {
        return $HC_0_0$Text__Lexer__Core__Empty;
    }
}

// Main.console_log

function Main__console_95_log($_0_x, $_1_w){
    return (console_log(($_0_x)));
}

// Text.Lexer.count

function Text__Lexer__count($_0_arg, $_1_arg){
    
    
    if($_0_arg.$1.equals((new $JSRTS.jsbn.BigInteger(("0"))))) {
        const $cg$4 = $_0_arg.$2;
        if(($cg$4.type === 1)) {
            
            if($cg$4.$1.equals((new $JSRTS.jsbn.BigInteger(("0"))))) {
                return $HC_0_0$Text__Lexer__Core__Empty;
            } else {
                const $_5_in = $cg$4.$1.subtract((new $JSRTS.jsbn.BigInteger(("1"))));
                return new $HC_2_6$Text__Lexer__Core__Alt(new $HC_2_4$Text__Lexer__Core__SeqEat($_1_arg, new $JSRTS.Lazy((function(){
                    return (function(){
                        return Text__Lexer___123_count_95_17_125_($_5_in, $_1_arg);
                    })();
                }))), $HC_0_0$Text__Lexer__Core__Empty);
            }
        } else {
            return Text__Lexer__many($_1_arg);
        }
    } else {
        const $_6_in = $_0_arg.$1.subtract((new $JSRTS.jsbn.BigInteger(("1"))));
        const $cg$7 = $_0_arg.$2;
        if(($cg$7.type === 1)) {
            
            if($cg$7.$1.equals((new $JSRTS.jsbn.BigInteger(("0"))))) {
                return $HC_0_1$Text__Lexer__Core__Fail;
            } else {
                const $_8_in = $cg$7.$1.subtract((new $JSRTS.jsbn.BigInteger(("1"))));
                return new $HC_2_4$Text__Lexer__Core__SeqEat($_1_arg, new $JSRTS.Lazy((function(){
                    return (function(){
                        return Text__Lexer___123_count_95_18_125_($_6_in, $_8_in, $_1_arg);
                    })();
                })));
            }
        } else {
            return new $HC_2_4$Text__Lexer__Core__SeqEat($_1_arg, new $JSRTS.Lazy((function(){
                return (function(){
                    return Text__Lexer___123_count_95_19_125_($_6_in, $_1_arg);
                })();
            })));
        }
    }
}

// Text.Parser.Core.doParse

function Text__Parser__Core__doParse($_0_arg, $_1_arg, $_2_arg, $_3_arg, $_4_arg, $_5_arg){
    
    if(($_5_arg.type === 8)) {
        const $cg$27 = _95_Text__Parser__Core__doParse_95_with_95_52(false, null, null, $_4_arg, $partial_4_8$Prelude__WellFounded__sizeAccessible_58_acc_58_0(null, null, null, null), $_5_arg.$1, $_5_arg.$3);
        if(($cg$27.type === 1)) {
            return new $HC_2_1$Text__Parser__Core__EmptyRes($_3_arg, $cg$27.$2);
        } else if(($cg$27.type === 0)) {
            
            if($cg$27.$1) {
                return new $HC_1_0$Text__Parser__Core__Failure($_3_arg);
            } else {
                return Text__Parser__Core__weakenRes(null, null, $_5_arg.$1, null, null, $_3_arg, _95_Text__Parser__Core__doParse_95_with_95_52(false, null, null, $_4_arg, $partial_4_8$Prelude__WellFounded__sizeAccessible_58_acc_58_0(null, null, null, null), $_5_arg.$2, $_5_arg.$4));
            }
        } else {
            return new $HC_4_2$Text__Parser__Core__NonEmptyRes($cg$27.$1, $_3_arg, $cg$27.$3, $cg$27.$4);
        }
    } else if(($_5_arg.type === 5)) {
        
        if((!$_2_arg)) {
            return new $HC_2_1$Text__Parser__Core__EmptyRes(true, $HC_0_0$MkUnit);
        } else {
            return new $HC_1_0$Text__Parser__Core__Failure(true);
        }
    } else if(($_5_arg.type === 3)) {
        
        if((!$_2_arg)) {
            
            if(($_4_arg.type === 1)) {
                return new $HC_1_0$Text__Parser__Core__Failure($_3_arg);
            } else if(($_4_arg.type === 0)) {
                return new $HC_2_1$Text__Parser__Core__EmptyRes($_3_arg, $HC_0_0$MkUnit);
            } else {
                return new $HC_1_0$Text__Parser__Core__Failure(true);
            }
        } else {
            return new $HC_1_0$Text__Parser__Core__Failure(true);
        }
    } else if(($_5_arg.type === 0)) {
        
        if((!$_2_arg)) {
            return new $HC_2_1$Text__Parser__Core__EmptyRes($_3_arg, $_5_arg.$1);
        } else {
            return new $HC_1_0$Text__Parser__Core__Failure(true);
        }
    } else if(($_5_arg.type === 4)) {
        
        if(($_4_arg.type === 1)) {
            return new $HC_1_0$Text__Parser__Core__Failure($_3_arg);
        } else if(($_4_arg.type === 0)) {
            return new $HC_1_0$Text__Parser__Core__Failure($_3_arg);
        } else {
            return new $HC_1_0$Text__Parser__Core__Failure(true);
        }
    } else if(($_5_arg.type === 6)) {
        
        if($_2_arg) {
            const $cg$16 = _95_Text__Parser__Core__doParse_95_with_95_52($_3_arg, null, null, $_4_arg, $partial_4_8$Prelude__WellFounded__sizeAccessible_58_acc_58_0(null, null, null, null), true, $_5_arg.$2);
            if(($cg$16.type === 0)) {
                return new $HC_1_0$Text__Parser__Core__Failure($cg$16.$1);
            } else {
                const $cg$18 = _95_Text__Parser__Core__doParse_95_with_95_52($cg$16.$2, null, null, $cg$16.$4, $partial_6_8$Prelude__WellFounded__sizeAccessible_58_acc_58_0(null, null, null, null, $cg$16.$4, Text__Parser__Core__shorter(null, $cg$16.$4, $cg$16.$1)), $_5_arg.$1, Text__Parser__Core___123_doParse_95_21_125_($_0_arg, $_1_arg, $_2_arg, $_3_arg, $_4_arg, $_5_arg, $_5_arg.$1, $_5_arg.$2, $_5_arg.$3, $cg$16.$1, $cg$16.$2, $cg$16.$3, $cg$16.$4)($cg$16.$3));
                if(($cg$18.type === 1)) {
                    return new $HC_4_2$Text__Parser__Core__NonEmptyRes($cg$16.$1, $cg$18.$1, $cg$18.$2, $cg$16.$4);
                } else if(($cg$18.type === 0)) {
                    return new $HC_1_0$Text__Parser__Core__Failure($cg$18.$1);
                } else {
                    const $cg$20 = $cg$16.$4;
                    return new $HC_4_2$Text__Parser__Core__NonEmptyRes(Prelude__List___43__43_(null, $cg$16.$1, new $HC_2_1$Prelude__List___58__58_($cg$20.$1, $cg$18.$1)), $cg$18.$2, $cg$18.$3, $cg$18.$4);
                }
            }
        } else {
            return new $HC_1_0$Text__Parser__Core__Failure(true);
        }
    } else if(($_5_arg.type === 7)) {
        const $cg$7 = _95_Text__Parser__Core__doParse_95_with_95_52($_3_arg, null, null, $_4_arg, $partial_4_8$Prelude__WellFounded__sizeAccessible_58_acc_58_0(null, null, null, null), $_5_arg.$1, $_5_arg.$3);
        if(($cg$7.type === 1)) {
            const $cg$13 = _95_Text__Parser__Core__doParse_95_with_95_52($cg$7.$1, null, null, $_4_arg, $partial_4_8$Prelude__WellFounded__sizeAccessible_58_acc_58_0(null, null, null, null), $_5_arg.$2, $_5_arg.$4($cg$7.$2));
            if(($cg$13.type === 1)) {
                return new $HC_2_1$Text__Parser__Core__EmptyRes($cg$13.$1, $cg$13.$2);
            } else if(($cg$13.type === 0)) {
                return new $HC_1_0$Text__Parser__Core__Failure($cg$13.$1);
            } else {
                return new $HC_4_2$Text__Parser__Core__NonEmptyRes($cg$13.$1, $cg$13.$2, $cg$13.$3, $cg$13.$4);
            }
        } else if(($cg$7.type === 0)) {
            return new $HC_1_0$Text__Parser__Core__Failure($cg$7.$1);
        } else {
            const $cg$9 = _95_Text__Parser__Core__doParse_95_with_95_52($cg$7.$2, null, null, $cg$7.$4, $partial_6_8$Prelude__WellFounded__sizeAccessible_58_acc_58_0(null, null, null, null, $cg$7.$4, Text__Parser__Core__shorter(null, $cg$7.$4, $cg$7.$1)), $_5_arg.$2, $_5_arg.$4($cg$7.$3));
            if(($cg$9.type === 1)) {
                return new $HC_4_2$Text__Parser__Core__NonEmptyRes($cg$7.$1, $cg$9.$1, $cg$9.$2, $cg$7.$4);
            } else if(($cg$9.type === 0)) {
                return new $HC_1_0$Text__Parser__Core__Failure($cg$9.$1);
            } else {
                const $cg$11 = $cg$7.$4;
                return new $HC_4_2$Text__Parser__Core__NonEmptyRes(Prelude__List___43__43_(null, $cg$7.$1, new $HC_2_1$Prelude__List___58__58_($cg$11.$1, $cg$9.$1)), $cg$9.$2, $cg$9.$3, $cg$9.$4);
            }
        }
    } else if(($_5_arg.type === 1)) {
        
        if($_2_arg) {
            
            if(($_4_arg.type === 1)) {
                const $cg$5 = $_5_arg.$1($_4_arg.$1);
                if(($cg$5.type === 1)) {
                    return new $HC_4_2$Text__Parser__Core__NonEmptyRes($HC_0_0$Prelude__List__Nil, $_3_arg, $cg$5.$1, $_4_arg.$2);
                } else {
                    return new $HC_1_0$Text__Parser__Core__Failure($_3_arg);
                }
            } else if(($_4_arg.type === 0)) {
                return new $HC_1_0$Text__Parser__Core__Failure($_3_arg);
            } else {
                return new $HC_1_0$Text__Parser__Core__Failure(true);
            }
        } else {
            return new $HC_1_0$Text__Parser__Core__Failure(true);
        }
    } else {
        return new $HC_1_0$Text__Parser__Core__Failure(true);
    }
}

// Text.Lexer.exact

function Text__Lexer__exact($_0_arg){
    let $cg$1 = null;
    if((((($_0_arg == "")) ? 1|0 : 0|0) === 0)) {
        $cg$1 = true;
    } else {
        $cg$1 = false;
    }
    
    
    if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$1, true).type === 1)) {
        return $HC_0_1$Text__Lexer__Core__Fail;
    } else {
        let $cg$3 = null;
        if((((($_0_arg.slice(1) == "")) ? 1|0 : 0|0) === 0)) {
            $cg$3 = true;
        } else {
            $cg$3 = false;
        }
        
        let $cg$4 = null;
        if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$3, true).type === 1)) {
            $cg$4 = $HC_0_0$Prelude__List__Nil;
        } else {
            let $cg$5 = null;
            if((((($_0_arg.slice(1).slice(1) == "")) ? 1|0 : 0|0) === 0)) {
                $cg$5 = true;
            } else {
                $cg$5 = false;
            }
            
            let $cg$6 = null;
            if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$5, true).type === 1)) {
                $cg$6 = $HC_0_0$Prelude__Strings__StrNil;
            } else {
                $cg$6 = new $HC_2_1$Prelude__Strings__StrCons($_0_arg.slice(1).slice(1)[0], $_0_arg.slice(1).slice(1).slice(1));
            }
            
            $cg$4 = new $HC_2_1$Prelude__List___58__58_($_0_arg.slice(1)[0], _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$6));
        }
        
        return Text__Lexer__Core__concatMap(null, null, $partial_0_1$Text__Lexer___123_exact_95_23_125_(), new $HC_2_1$Prelude__List___58__58_($_0_arg[0], $cg$4));
    }
}

// Control.Monad.State.execState

function Control__Monad__State__execState($_0_arg, $_1_arg, $_2_arg, $_8_in){
    const $cg$2 = $_2_arg($_8_in);
    return $cg$2.$2;
}

// Prelude.List.filter

function Prelude__List__filter($_0_arg, $_1_arg, $_2_arg){
    for(;;) {
        
        if(($_2_arg.type === 1)) {
            
            if($_1_arg($_2_arg.$1)) {
                return new $HC_2_1$Prelude__List___58__58_($_2_arg.$1, Prelude__List__filter(null, $_1_arg, $_2_arg.$2));
            } else {
                $_0_arg = null;
                $_1_arg = $_1_arg;
                $_2_arg = $_2_arg.$2;
            }
        } else {
            return $_2_arg;
        }
    }
}

// Printf.format

function Printf__format($_0_arg){
    
    if(($_0_arg.type === 1)) {
        
        if(($_0_arg.$1 === "%")) {
            const $cg$4 = $_0_arg.$2;
            if(($cg$4.type === 1)) {
                const $cg$6 = $cg$4.$1;
                if(($cg$6 === "d")) {
                    return new $HC_1_0$Printf__FInt(Printf__format($cg$4.$2));
                } else if(($cg$6 === "s")) {
                    return new $HC_1_1$Printf__FString(Printf__format($cg$4.$2));
                } else {
                    return new $HC_2_2$Printf__FOther($_0_arg.$1, Printf__format($_0_arg.$2));
                }
            } else {
                return new $HC_2_2$Printf__FOther($_0_arg.$1, Printf__format($_0_arg.$2));
            }
        } else {
            return new $HC_2_2$Printf__FOther($_0_arg.$1, Printf__format($_0_arg.$2));
        }
    } else {
        return $HC_0_3$Printf__FEnd;
    }
}

// Text.Lexer.Core.fspan

function Text__Lexer__Core__fspan($_0_arg, $_1_arg){
    const $cg$2 = Text__Lexer__Core__fspanEnd((new $JSRTS.jsbn.BigInteger(("0"))), $_0_arg, $_1_arg);
    return new $HC_2_0$Builtins__MkPair(($JSRTS.prim_strSubstr((0), ((($cg$2.$1).intValue()|0)), ($_1_arg))), $cg$2.$2);
}

// Text.Lexer.Core.fspanEnd

function Text__Lexer__Core__fspanEnd($_0_arg, $_1_arg, $_2_arg){
    for(;;) {
        
        if(($_2_arg === "")) {
            return new $HC_2_0$Builtins__MkPair($_0_arg, "");
        } else {
            
            if($_1_arg($_2_arg[0])) {
                $_0_arg = $_0_arg.add((new $JSRTS.jsbn.BigInteger(("1"))));
                $_1_arg = $_1_arg;
                $_2_arg = $_2_arg.slice(1);
            } else {
                return new $HC_2_0$Builtins__MkPair($_0_arg, $_2_arg);
            }
        }
    }
}

// Main.get_qty_int

function Main__get_95_qty_95_int($_0_x, $_1_w){
    return (get_qty_int(($_0_x)));
}

// Main.get_qty_int_flag

function Main__get_95_qty_95_int_95_flag($_0_x, $_1_w){
    return (get_qty_int_flag(($_0_x)));
}

// Data.SortedMap.insert

function Data__SortedMap__insert($_0_arg, $_1_arg, $_2_arg, $_3_arg, $_4_arg){
    
    if(($_4_arg.type === 0)) {
        return new $HC_2_1$Data__SortedMap__M($_4_arg.$1, new $HC_2_0$Data__SortedMap__Leaf($_2_arg, $_3_arg));
    } else {
        const $cg$3 = Data__SortedMap__treeInsert(null, null, $_4_arg.$1, null, $_2_arg, $_3_arg, $_4_arg.$2);
        if(($cg$3.type === 0)) {
            return new $HC_2_1$Data__SortedMap__M($_4_arg.$1, $cg$3.$1);
        } else {
            return new $HC_2_1$Data__SortedMap__M($_4_arg.$1, $cg$3.$1);
        }
    }
}

// Main.insert_adjancent_html

function Main__insert_95_adjancent_95_html($_0_x, $_1_x1, $_2_x2, $_3_w){
    return (insert_adjancent_html(($_0_x),($_1_x1),($_2_x2)));
}

// Exchange.interpret1

function Exchange__interpret1($_0_arg){
    
    if(($_0_arg.type === 1)) {
        return $partial_7_8$Prelude__Monad__Control__Monad__State___64_Prelude__Monad__Monad_36_StateT_32_stateType_32_m_58__33__62__62__61__58_0(null, null, null, null, $partial_0_4$Exchange___123_interpret1_95_24_125_(), Exchange__interpret1($_0_arg.$2), $partial_1_2$Exchange___123_interpret1_95_32_125_($_0_arg.$1));
    } else {
        return $partial_0_1$Exchange___123_interpret1_95_33_125_();
    }
}

// Prelude.Chars.isControl

function Prelude__Chars__isControl($_0_arg){
    let $cg$1 = null;
    if((Prelude__Interfaces__Prelude__Interfaces___64_Prelude__Interfaces__Ord_36_Char_58__33_compare_58_0($_0_arg, "\x00") > 0)) {
        $cg$1 = true;
    } else {
        $cg$1 = ($_0_arg === "\x00");
    }
    
    let $cg$2 = null;
    if($cg$1) {
        
        if((Prelude__Interfaces__Prelude__Interfaces___64_Prelude__Interfaces__Ord_36_Char_58__33_compare_58_0($_0_arg, "\x1f") < 0)) {
            $cg$2 = true;
        } else {
            $cg$2 = ($_0_arg === "\x1f");
        }
    } else {
        $cg$2 = false;
    }
    
    
    if($cg$2) {
        return true;
    } else {
        let $cg$5 = null;
        if((Prelude__Interfaces__Prelude__Interfaces___64_Prelude__Interfaces__Ord_36_Char_58__33_compare_58_0($_0_arg, "\x7f") > 0)) {
            $cg$5 = true;
        } else {
            $cg$5 = ($_0_arg === "\x7f");
        }
        
        
        if($cg$5) {
            
            if((Prelude__Interfaces__Prelude__Interfaces___64_Prelude__Interfaces__Ord_36_Char_58__33_compare_58_0($_0_arg, "\x9f") < 0)) {
                return true;
            } else {
                return ($_0_arg === "\x9f");
            }
        } else {
            return false;
        }
    }
}

// Prelude.Chars.isDigit

function Prelude__Chars__isDigit($_0_arg){
    let $cg$1 = null;
    if((Prelude__Interfaces__Prelude__Interfaces___64_Prelude__Interfaces__Ord_36_Char_58__33_compare_58_0($_0_arg, "0") > 0)) {
        $cg$1 = true;
    } else {
        $cg$1 = ($_0_arg === "0");
    }
    
    
    if($cg$1) {
        
        if((Prelude__Interfaces__Prelude__Interfaces___64_Prelude__Interfaces__Ord_36_Char_58__33_compare_58_0($_0_arg, "9") < 0)) {
            return true;
        } else {
            return ($_0_arg === "9");
        }
    } else {
        return false;
    }
}

// Prelude.Chars.isLower

function Prelude__Chars__isLower($_0_arg){
    let $cg$1 = null;
    if((Prelude__Interfaces__Prelude__Interfaces___64_Prelude__Interfaces__Ord_36_Char_58__33_compare_58_0($_0_arg, "a") > 0)) {
        $cg$1 = true;
    } else {
        $cg$1 = ($_0_arg === "a");
    }
    
    
    if($cg$1) {
        
        if((Prelude__Interfaces__Prelude__Interfaces___64_Prelude__Interfaces__Ord_36_Char_58__33_compare_58_0($_0_arg, "z") < 0)) {
            return true;
        } else {
            return ($_0_arg === "z");
        }
    } else {
        return false;
    }
}

// Prelude.Chars.isSpace

function Prelude__Chars__isSpace($_0_arg){
    
    if((((($_0_arg === " ")) ? 1|0 : 0|0) === 0)) {
        
        if((((($_0_arg === "\t")) ? 1|0 : 0|0) === 0)) {
            
            if((((($_0_arg === "\r")) ? 1|0 : 0|0) === 0)) {
                
                if((((($_0_arg === "\n")) ? 1|0 : 0|0) === 0)) {
                    
                    if((((($_0_arg === "\f")) ? 1|0 : 0|0) === 0)) {
                        
                        if((((($_0_arg === "\v")) ? 1|0 : 0|0) === 0)) {
                            return ($_0_arg === "\xa0");
                        } else {
                            return true;
                        }
                    } else {
                        return true;
                    }
                } else {
                    return true;
                }
            } else {
                return true;
            }
        } else {
            return true;
        }
    } else {
        return true;
    }
}

// Language.JSON.Parser.json

function Language__JSON__Parser__json(){
    return new $HC_4_8$Text__Parser__Core__Alt(true, true, Language__JSON__Parser__object(), new $HC_4_8$Text__Parser__Core__Alt(true, true, Language__JSON__Parser__array(), new $HC_4_8$Text__Parser__Core__Alt(true, true, Prelude__Functor__Text__Parser__Core___64_Prelude__Functor__Functor_36_Grammar_32_tok_32_c_58__33_map_58_0(null, true, null, null, $partial_0_1$Language__JSON__Parser___123_json_95_35_125_(), Language__JSON__Parser__rawString()), new $HC_4_8$Text__Parser__Core__Alt(true, true, Prelude__Functor__Text__Parser__Core___64_Prelude__Functor__Functor_36_Grammar_32_tok_32_c_58__33_map_58_0(null, true, null, null, $partial_0_1$Language__JSON__Parser___123_boolean_95_16_125_(), PE_95_match_95_44e5df34($HC_0_0$Language__JSON__Tokens__JTBoolean)), new $HC_4_8$Text__Parser__Core__Alt(true, true, Prelude__Functor__Text__Parser__Core___64_Prelude__Functor__Functor_36_Grammar_32_tok_32_c_58__33_map_58_0(null, true, null, null, $partial_0_1$Language__JSON__Parser___123_json_95_37_125_(), PE_95_match_95_44e5df34($HC_0_1$Language__JSON__Tokens__JTNumber)), Prelude__Functor__Text__Parser__Core___64_Prelude__Functor__Functor_36_Grammar_32_tok_32_c_58__33_map_58_0(null, true, null, null, $partial_0_1$Language__JSON__Parser___123_json_95_38_125_(), PE_95_match_95_44e5df34($HC_0_3$Language__JSON__Tokens__JTNull)))))));
}

// Language.JSON.String.Lexer.jsonStringTokenMap

function Language__JSON__String__Lexer__jsonStringTokenMap(){
    return Text__Lexer__toTokenMap(null, new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$Builtins__MkPair(new $HC_1_3$Text__Lexer__Core__Pred($partial_0_1$Language__JSON__String__Lexer___123_jsonStringTokenMap_95_39_125_()), $HC_0_0$Language__JSON__String__Tokens__JSTQuote), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$Builtins__MkPair(Language__JSON__String__Lexer__unicodeEscape(), $HC_0_3$Language__JSON__String__Tokens__JSTUnicodeEscape), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$Builtins__MkPair(Language__JSON__String__Lexer__simpleEscape(), $HC_0_2$Language__JSON__String__Tokens__JSTSimpleEscape), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$Builtins__MkPair(Language__JSON__String__Lexer__legalChar(), $HC_0_1$Language__JSON__String__Tokens__JSTChar), $HC_0_0$Prelude__List__Nil)))));
}

// Language.JSON.Lexer.jsonTokenMap

function Language__JSON__Lexer__jsonTokenMap(){
    return Text__Lexer__toTokenMap(null, new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$Builtins__MkPair(new $HC_2_4$Text__Lexer__Core__SeqEat(new $HC_1_3$Text__Lexer__Core__Pred($partial_0_1$Prelude__Chars__isSpace()), new $JSRTS.Lazy((function(){
        return (function(){
            return Language__JSON__Lexer___123_jsonTokenMap_95_40_125_();
        })();
    }))), $HC_0_5$Language__JSON__Tokens__JTIgnore), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$Builtins__MkPair(new $HC_1_3$Text__Lexer__Core__Pred($partial_0_1$Language__JSON__Lexer___123_jsonTokenMap_95_41_125_()), new $HC_1_4$Language__JSON__Tokens__JTPunct($HC_0_0$Language__JSON__Tokens__Comma)), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$Builtins__MkPair(new $HC_1_3$Text__Lexer__Core__Pred($partial_0_1$Language__JSON__Lexer___123_jsonTokenMap_95_42_125_()), new $HC_1_4$Language__JSON__Tokens__JTPunct($HC_0_1$Language__JSON__Tokens__Colon)), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$Builtins__MkPair(new $HC_1_3$Text__Lexer__Core__Pred($partial_0_1$Language__JSON__Lexer___123_jsonTokenMap_95_43_125_()), new $HC_1_4$Language__JSON__Tokens__JTPunct(new $HC_1_2$Language__JSON__Tokens__Square($HC_0_0$Language__JSON__Tokens__Open))), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$Builtins__MkPair(new $HC_1_3$Text__Lexer__Core__Pred($partial_0_1$Language__JSON__Lexer___123_jsonTokenMap_95_44_125_()), new $HC_1_4$Language__JSON__Tokens__JTPunct(new $HC_1_2$Language__JSON__Tokens__Square($HC_0_1$Language__JSON__Tokens__Close))), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$Builtins__MkPair(new $HC_1_3$Text__Lexer__Core__Pred($partial_0_1$Language__JSON__Lexer___123_jsonTokenMap_95_45_125_()), new $HC_1_4$Language__JSON__Tokens__JTPunct(new $HC_1_3$Language__JSON__Tokens__Curly($HC_0_0$Language__JSON__Tokens__Open))), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$Builtins__MkPair(new $HC_1_3$Text__Lexer__Core__Pred($partial_0_1$Language__JSON__Lexer___123_jsonTokenMap_95_46_125_()), new $HC_1_4$Language__JSON__Tokens__JTPunct(new $HC_1_3$Language__JSON__Tokens__Curly($HC_0_1$Language__JSON__Tokens__Close))), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$Builtins__MkPair(Text__Lexer__exact("null"), $HC_0_3$Language__JSON__Tokens__JTNull), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$Builtins__MkPair(new $HC_2_6$Text__Lexer__Core__Alt(Text__Lexer__exact("true"), Text__Lexer__exact("false")), $HC_0_0$Language__JSON__Tokens__JTBoolean), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$Builtins__MkPair(Language__JSON__Lexer__numberLit(), $HC_0_1$Language__JSON__Tokens__JTNumber), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$Builtins__MkPair(Language__JSON__String__permissiveStringLit(), $HC_0_2$Language__JSON__Tokens__JTString), $HC_0_0$Prelude__List__Nil))))))))))));
}

// Exchange.key_empty

function Exchange__key_95_empty(){
    return new $HC_1_0$Data__SortedMap__Empty(new $HC_3_0$Prelude__Interfaces__Ord_95_ictor($partial_0_2$Exchange___123_key_95_empty_95_47_125_(), $partial_0_2$Exchange___123_key_95_empty_95_48_125_(), $partial_0_2$Exchange___123_key_95_empty_95_49_125_()));
}

// Language.JSON.String.Lexer.legalChar

function Language__JSON__String__Lexer__legalChar(){
    return new $HC_2_5$Text__Lexer__Core__SeqEmpty(new $HC_2_2$Text__Lexer__Core__Lookahead(false, new $HC_2_6$Text__Lexer__Core__Alt(new $HC_1_3$Text__Lexer__Core__Pred($partial_0_1$Language__JSON__String__Lexer___123_jsonStringTokenMap_95_39_125_()), new $HC_2_6$Text__Lexer__Core__Alt(new $HC_1_3$Text__Lexer__Core__Pred($partial_0_1$Language__JSON__String__Lexer___123_legalChar_95_51_125_()), new $HC_1_3$Text__Lexer__Core__Pred($partial_0_1$Prelude__Chars__isControl())))), new $HC_1_3$Text__Lexer__Core__Pred($partial_0_1$Language__JSON__String__Lexer___123_legalChar_95_52_125_()));
}

// Prelude.List.length

function Prelude__List__length($_0_arg, $_1_arg){
    
    if(($_1_arg.type === 1)) {
        return Prelude__List__length(null, $_1_arg.$2).add((new $JSRTS.jsbn.BigInteger(("1"))));
    } else {
        return (new $JSRTS.jsbn.BigInteger(("0")));
    }
}

// Text.Lexer.Core.lex

function Text__Lexer__Core__lex($_0_arg, $_1_arg, $_2_arg){
    const $cg$2 = Text__Lexer__Core__tokenise(null, 0, 0, $HC_0_0$Prelude__List__Nil, $_1_arg, new $HC_2_0$Text__Lexer__Core__MkStrLen($_2_arg, (new $JSRTS.jsbn.BigInteger(''+((($_2_arg).length))))));
    const $cg$4 = $cg$2.$2;
    const $cg$6 = $cg$4.$2;
    const $cg$8 = $cg$6.$2;
    let $cg$7 = null;
    $cg$7 = $cg$8.$1;
    return new $HC_2_0$Builtins__MkPair($cg$2.$1, new $HC_2_0$Builtins__MkPair($cg$4.$1, new $HC_2_0$Builtins__MkPair($cg$6.$1, $cg$7)));
}

// Language.JSON.Lexer.lexJSON

function Language__JSON__Lexer__lexJSON($_0_arg){
    const $cg$2 = Text__Lexer__Core__lex(null, Language__JSON__Lexer__jsonTokenMap(), $_0_arg);
    const $cg$4 = $cg$2.$2;
    const $cg$6 = $cg$4.$2;
    
    if(($cg$6.$2 === "")) {
        return new $HC_1_1$Prelude__Maybe__Just(Prelude__Functor__Prelude__List___64_Prelude__Functor__Functor_36_List_58__33_map_58_0(null, null, $partial_0_1$Language__JSON__Lexer___123_lexJSON_95_53_125_(), $cg$2.$1));
    } else {
        return $HC_0_0$Prelude__Maybe__Nothing;
    }
}

// Language.JSON.String.Lexer.lexString

function Language__JSON__String__Lexer__lexString($_0_arg){
    const $cg$2 = Text__Lexer__Core__lex(null, Language__JSON__String__Lexer__jsonStringTokenMap(), $_0_arg);
    const $cg$4 = $cg$2.$2;
    const $cg$6 = $cg$4.$2;
    
    if(($cg$6.$2 === "")) {
        return new $HC_1_1$Prelude__Maybe__Just(Prelude__Functor__Prelude__List___64_Prelude__Functor__Functor_36_List_58__33_map_58_0(null, null, $partial_0_1$Language__JSON__Lexer___123_lexJSON_95_53_125_(), $cg$2.$1));
    } else {
        return $HC_0_0$Prelude__Maybe__Nothing;
    }
}

// Text.Lexer.like

function Text__Lexer__like($_0_arg){
    return new $HC_1_3$Text__Lexer__Core__Pred($partial_1_2$Text__Lexer___123_like_95_55_125_($_0_arg));
}

// Main.line_list2io

function Main__line_95_list2io($_0_arg, $_1_arg, $_13_in){
    for(;;) {
        
        if(($_1_arg.type === 1)) {
            const $cg$3 = $_1_arg.$1;
            const $cg$5 = $cg$3.$1;
            let $_57_in = null;
            $_57_in = ((($cg$5.$1).toString()) + ((($cg$5.$2).toString()) + ((($cg$5.$3).toString()) + ((($cg$5.$4).toString()) + ((($cg$5.$5).toString()) + (($cg$5.$6).toString()))))));
            const $_64_in = Main__get_95_qty_95_int_95_flag($_57_in, $_13_in);
            let $_65_in = null;
            if((((($_64_in === 0)) ? 1|0 : 0|0) === 0)) {
                $_65_in = io_95_bind(null, null, null, $partial_1_2$Main__get_95_qty_95_int($_57_in), $partial_2_3$Main___123_line_95_list2io_95_56_125_($cg$3.$2, $_57_in), $_13_in);
            } else {
                const $cg$8 = $cg$3.$1;
                let $cg$7 = null;
                const $cg$10 = $cg$3.$2;
                let $cg$9 = null;
                $cg$9 = $cg$10.$1.subtract($cg$10.$2);
                $cg$7 = Snippets__new_95_row((($cg$8.$4).toString()), new $HC_1_1$Prelude__Maybe__Just($_57_in), $cg$9, $cg$8.$6);
                $_65_in = Main__insert_95_adjancent_95_html($_0_arg, "beforeend", $cg$7, $_13_in);
            }
            
            $_0_arg = $_0_arg;
            $_1_arg = $_1_arg.$2;
            $_13_in = $_13_in;
        } else {
            return $HC_0_0$MkUnit;
        }
    }
}

// Main.line_list2io_amend

function Main__line_95_list2io_95_amend($_0_arg, $_1_arg, $_4_in){
    for(;;) {
        
        if(($_1_arg.type === 1)) {
            const $cg$3 = $_1_arg.$1;
            let $cg$2 = null;
            const $cg$5 = $cg$3.$1;
            const $cg$7 = $cg$3.$2;
            let $cg$6 = null;
            $cg$6 = $cg$7.$1.subtract($cg$7.$2);
            $cg$2 = Snippets__new_95_row((($cg$5.$4).toString()), $HC_0_0$Prelude__Maybe__Nothing, $cg$6, $cg$5.$6);
            const $_17_in = Main__insert_95_adjancent_95_html($_0_arg, "beforeend", $cg$2, $_4_in);
            $_0_arg = $_0_arg;
            $_1_arg = $_1_arg.$2;
            $_4_in = $_4_in;
        } else {
            return $HC_0_0$MkUnit;
        }
    }
}

// Prelude.Nat.lteRefl

function Prelude__Nat__lteRefl($_0_arg){
    
    if($_0_arg.equals((new $JSRTS.jsbn.BigInteger(("0"))))) {
        return $HC_0_0$Prelude__Nat__LTEZero;
    } else {
        const $_1_in = $_0_arg.subtract((new $JSRTS.jsbn.BigInteger(("1"))));
        return $HC_0_1$Prelude__Nat__LTESucc;
    }
}

// Main.main

function Main__main($_0_in){
    const $_1_in = Main__insert_95_adjancent_95_html("so_composite", "beforeend", Snippets__table_95_card("so_table1"), $_0_in);
    const $_2_in = Main__line_95_list2io("so_table1", Main__test_95_list(), $_0_in);
    const $_3_in = Main__calc_95_sha1("<tr >  <td scope=\"row\">AB</td>   <td></td> <td id=\"so4_qty\" >1</td>  <td>Unit</td> <td>STE20</td> <td>188</td> <td>0</td>     </tr>", $_0_in);
    const $_4_in = Main__calc_95_sha256("<tr >  <td scope=\"row\">AB</td>   <td></td> <td id=\"so4_qty\" >1</td>  <td>Unit</td> <td>STE20</td> <td>188</td> <td>0</td>     </tr>", $_0_in);
    let $cg$1 = null;
    if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0(true, true).type === 1)) {
        $cg$1 = $HC_0_0$Prelude__List__Nil;
    } else {
        let $cg$2 = null;
        if((((("so_table_amendments%d".slice(1) == "")) ? 1|0 : 0|0) === 0)) {
            $cg$2 = true;
        } else {
            $cg$2 = false;
        }
        
        let $cg$3 = null;
        if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$2, true).type === 1)) {
            $cg$3 = $HC_0_0$Prelude__Strings__StrNil;
        } else {
            $cg$3 = new $HC_2_1$Prelude__Strings__StrCons("so_table_amendments%d".slice(1)[0], "so_table_amendments%d".slice(1).slice(1));
        }
        
        $cg$1 = new $HC_2_1$Prelude__List___58__58_("so_table_amendments%d"[0], _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$3));
    }
    
    const $_7_in = Main__insert_95_adjancent_95_html("so_amendments", "beforeend", Snippets__table_95_card(Printf__toFunction(Printf__format($cg$1), "")((new $JSRTS.jsbn.BigInteger(("1"))))), $_0_in);
    let $cg$4 = null;
    if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0(true, true).type === 1)) {
        $cg$4 = $HC_0_0$Prelude__List__Nil;
    } else {
        let $cg$5 = null;
        if((((("so_table_amendments%d".slice(1) == "")) ? 1|0 : 0|0) === 0)) {
            $cg$5 = true;
        } else {
            $cg$5 = false;
        }
        
        let $cg$6 = null;
        if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$5, true).type === 1)) {
            $cg$6 = $HC_0_0$Prelude__Strings__StrNil;
        } else {
            $cg$6 = new $HC_2_1$Prelude__Strings__StrCons("so_table_amendments%d".slice(1)[0], "so_table_amendments%d".slice(1).slice(1));
        }
        
        $cg$4 = new $HC_2_1$Prelude__List___58__58_("so_table_amendments%d"[0], _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$6));
    }
    
    const $_10_in = Main__line_95_list2io_95_amend(Printf__toFunction(Printf__format($cg$4), "")((new $JSRTS.jsbn.BigInteger(("1")))), Main__test_95_list(), $_0_in);
    let $cg$7 = null;
    if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0(true, true).type === 1)) {
        $cg$7 = $HC_0_0$Prelude__List__Nil;
    } else {
        let $cg$8 = null;
        if((((("so_table_amendments%d".slice(1) == "")) ? 1|0 : 0|0) === 0)) {
            $cg$8 = true;
        } else {
            $cg$8 = false;
        }
        
        let $cg$9 = null;
        if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$8, true).type === 1)) {
            $cg$9 = $HC_0_0$Prelude__Strings__StrNil;
        } else {
            $cg$9 = new $HC_2_1$Prelude__Strings__StrCons("so_table_amendments%d".slice(1)[0], "so_table_amendments%d".slice(1).slice(1));
        }
        
        $cg$7 = new $HC_2_1$Prelude__List___58__58_("so_table_amendments%d"[0], _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$9));
    }
    
    const $_13_in = Main__insert_95_adjancent_95_html("so_amendments", "beforeend", Snippets__table_95_card(Printf__toFunction(Printf__format($cg$7), "")((new $JSRTS.jsbn.BigInteger(("2"))))), $_0_in);
    let $cg$10 = null;
    if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0(true, true).type === 1)) {
        $cg$10 = $HC_0_0$Prelude__List__Nil;
    } else {
        let $cg$11 = null;
        if((((("so_table_amendments%d".slice(1) == "")) ? 1|0 : 0|0) === 0)) {
            $cg$11 = true;
        } else {
            $cg$11 = false;
        }
        
        let $cg$12 = null;
        if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$11, true).type === 1)) {
            $cg$12 = $HC_0_0$Prelude__Strings__StrNil;
        } else {
            $cg$12 = new $HC_2_1$Prelude__Strings__StrCons("so_table_amendments%d".slice(1)[0], "so_table_amendments%d".slice(1).slice(1));
        }
        
        $cg$10 = new $HC_2_1$Prelude__List___58__58_("so_table_amendments%d"[0], _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$12));
    }
    
    const $_16_in = Main__line_95_list2io_95_amend(Printf__toFunction(Printf__format($cg$10), "")((new $JSRTS.jsbn.BigInteger(("2")))), Main__test_95_list2(), $_0_in);
    const $_17_in = Main__line_95_list2io("so_table1", Main__test_95_list2(), $_0_in);
    let $cg$13 = null;
    if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0(true, true).type === 1)) {
        $cg$13 = $HC_0_0$Prelude__List__Nil;
    } else {
        let $cg$14 = null;
        if((((("so_table_amendments%d".slice(1) == "")) ? 1|0 : 0|0) === 0)) {
            $cg$14 = true;
        } else {
            $cg$14 = false;
        }
        
        let $cg$15 = null;
        if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$14, true).type === 1)) {
            $cg$15 = $HC_0_0$Prelude__Strings__StrNil;
        } else {
            $cg$15 = new $HC_2_1$Prelude__Strings__StrCons("so_table_amendments%d".slice(1)[0], "so_table_amendments%d".slice(1).slice(1));
        }
        
        $cg$13 = new $HC_2_1$Prelude__List___58__58_("so_table_amendments%d"[0], _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$15));
    }
    
    const $_20_in = Main__insert_95_adjancent_95_html("so_amendments", "beforeend", Snippets__table_95_card(Printf__toFunction(Printf__format($cg$13), "")((new $JSRTS.jsbn.BigInteger(("3"))))), $_0_in);
    let $cg$16 = null;
    if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0(true, true).type === 1)) {
        $cg$16 = $HC_0_0$Prelude__List__Nil;
    } else {
        let $cg$17 = null;
        if((((("so_table_amendments%d".slice(1) == "")) ? 1|0 : 0|0) === 0)) {
            $cg$17 = true;
        } else {
            $cg$17 = false;
        }
        
        let $cg$18 = null;
        if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$17, true).type === 1)) {
            $cg$18 = $HC_0_0$Prelude__Strings__StrNil;
        } else {
            $cg$18 = new $HC_2_1$Prelude__Strings__StrCons("so_table_amendments%d".slice(1)[0], "so_table_amendments%d".slice(1).slice(1));
        }
        
        $cg$16 = new $HC_2_1$Prelude__List___58__58_("so_table_amendments%d"[0], _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$18));
    }
    
    const $_23_in = Main__line_95_list2io_95_amend(Printf__toFunction(Printf__format($cg$16), "")((new $JSRTS.jsbn.BigInteger(("3")))), Main__test_95_list3(), $_0_in);
    const $_24_in = Main__line_95_list2io("so_table1", Main__test_95_list3(), $_0_in);
    let $cg$19 = null;
    if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0(true, true).type === 1)) {
        $cg$19 = $HC_0_0$Prelude__List__Nil;
    } else {
        let $cg$20 = null;
        if((((("so_table_amendments%d".slice(1) == "")) ? 1|0 : 0|0) === 0)) {
            $cg$20 = true;
        } else {
            $cg$20 = false;
        }
        
        let $cg$21 = null;
        if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$20, true).type === 1)) {
            $cg$21 = $HC_0_0$Prelude__Strings__StrNil;
        } else {
            $cg$21 = new $HC_2_1$Prelude__Strings__StrCons("so_table_amendments%d".slice(1)[0], "so_table_amendments%d".slice(1).slice(1));
        }
        
        $cg$19 = new $HC_2_1$Prelude__List___58__58_("so_table_amendments%d"[0], _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$21));
    }
    
    const $_27_in = Main__insert_95_adjancent_95_html("so_amendments", "beforeend", Snippets__table_95_card(Printf__toFunction(Printf__format($cg$19), "")((new $JSRTS.jsbn.BigInteger(("4"))))), $_0_in);
    let $cg$22 = null;
    if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0(true, true).type === 1)) {
        $cg$22 = $HC_0_0$Prelude__List__Nil;
    } else {
        let $cg$23 = null;
        if((((("so_table_amendments%d".slice(1) == "")) ? 1|0 : 0|0) === 0)) {
            $cg$23 = true;
        } else {
            $cg$23 = false;
        }
        
        let $cg$24 = null;
        if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$23, true).type === 1)) {
            $cg$24 = $HC_0_0$Prelude__Strings__StrNil;
        } else {
            $cg$24 = new $HC_2_1$Prelude__Strings__StrCons("so_table_amendments%d".slice(1)[0], "so_table_amendments%d".slice(1).slice(1));
        }
        
        $cg$22 = new $HC_2_1$Prelude__List___58__58_("so_table_amendments%d"[0], _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$24));
    }
    
    const $_30_in = Main__line_95_list2io_95_amend(Printf__toFunction(Printf__format($cg$22), "")((new $JSRTS.jsbn.BigInteger(("4")))), Main__test_95_list4(), $_0_in);
    const $_31_in = Main__line_95_list2io("so_table1", Main__test_95_list4(), $_0_in);
    const $_32_in = Main__console_95_log($_3_in, $_0_in);
    const $_33_in = Main__console_95_log($_4_in, $_0_in);
    const $cg$26 = Language__JSON__Lexer__lexJSON("{\n  \"key1\": [11,89],\n  \"key2\": {\n      \"key2.1\": true,\n      \"key2.2\": {\n        \"key2.2.1\": \"bar\",\n        \"key2.2.2\": 200\n      }\n    }\n  }");
    let $cg$25 = null;
    if(($cg$26.type === 1)) {
        $cg$25 = Language__JSON__Parser__parseJSON($cg$26.$1);
    } else {
        $cg$25 = $HC_0_0$Prelude__Maybe__Nothing;
    }
    
    let $_38_in = null;
    if(($cg$25.type === 1)) {
        $_38_in = Main__console_95_log((Prelude__Foldable__Prelude__List___64_Prelude__Foldable__Foldable_36_List_58__33_foldr_58_0(null, null, $partial_0_2$prim_95__95_strCons(), "", Prelude__List__replicate(null, (new $JSRTS.jsbn.BigInteger(("0"))), " ")) + Language__JSON__Data__format_58_formatValue_58_0(null, null, null, (new $JSRTS.jsbn.BigInteger(("0"))), (new $JSRTS.jsbn.BigInteger(("2"))), $cg$25.$1)), $_0_in);
    } else {
        $_38_in = Main__console_95_log("na", $_0_in);
    }
    
    let $cg$28 = null;
    if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0(true, true).type === 1)) {
        $cg$28 = $HC_0_0$Prelude__List__Nil;
    } else {
        let $cg$29 = null;
        if((((("%d%s".slice(1) == "")) ? 1|0 : 0|0) === 0)) {
            $cg$29 = true;
        } else {
            $cg$29 = false;
        }
        
        let $cg$30 = null;
        if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$29, true).type === 1)) {
            $cg$30 = $HC_0_0$Prelude__Strings__StrNil;
        } else {
            $cg$30 = new $HC_2_1$Prelude__Strings__StrCons("%d%s".slice(1)[0], "%d%s".slice(1).slice(1));
        }
        
        $cg$28 = new $HC_2_1$Prelude__List___58__58_("%d%s"[0], _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$30));
    }
    
    const $_41_in = Main__console_95_log(Printf__toFunction(Printf__format($cg$28), "")((new $JSRTS.jsbn.BigInteger(("5"))))("hello!"), $_0_in);
    return Main__console_95_log(("[" + (Prelude__Show__Prelude__Show___64_Prelude__Show__Show_36_List_32_a_58__33_show_58_0_58_show_39__58_0(null, null, $partial_0_1$Main___123_main_95_57_125_(), "", Data__SortedMap__toList(null, null, Control__Monad__State__execState(null, null, Exchange__interpret1(Main__test_95_list()), Exchange__key_95_empty()))) + "]")), $_0_in);
}

// Text.Lexer.many

function Text__Lexer__many($_0_arg){
    return new $HC_2_6$Text__Lexer__Core__Alt(new $HC_2_4$Text__Lexer__Core__SeqEat($_0_arg, new $JSRTS.Lazy((function(){
        return (function(){
            return Text__Lexer___123_many_95_58_125_($_0_arg);
        })();
    }))), $HC_0_0$Text__Lexer__Core__Empty);
}

// Prelude.Nat.minus

function Prelude__Nat__minus($_0_arg, $_1_arg){
    for(;;) {
        
        if($_0_arg.equals((new $JSRTS.jsbn.BigInteger(("0"))))) {
            return (new $JSRTS.jsbn.BigInteger(("0")));
        } else {
            
            if($_1_arg.equals((new $JSRTS.jsbn.BigInteger(("0"))))) {
                return $_0_arg;
            } else {
                const $_2_in = $_1_arg.subtract((new $JSRTS.jsbn.BigInteger(("1"))));
                $_0_arg = $_0_arg.subtract((new $JSRTS.jsbn.BigInteger(("1"))));
                $_1_arg = $_2_in;
            }
        }
    }
}

// Snippets.new_row

function Snippets__new_95_row($_0_arg, $_1_arg, $_2_arg, $_3_arg){
    
    if(($_1_arg.type === 1)) {
        let $cg$5 = null;
        if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0(true, true).type === 1)) {
            $cg$5 = $HC_0_0$Prelude__List__Nil;
        } else {
            let $cg$6 = null;
            if((((("<tr >  <td scope=\"row\"> %s </td>   <td>%s</td> <td %s> %d </td>  <td>%s </td> <td>STE20</td> <td>%d</td> <td>0</td>     </tr>".slice(1) == "")) ? 1|0 : 0|0) === 0)) {
                $cg$6 = true;
            } else {
                $cg$6 = false;
            }
            
            let $cg$7 = null;
            if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$6, true).type === 1)) {
                $cg$7 = $HC_0_0$Prelude__Strings__StrNil;
            } else {
                $cg$7 = new $HC_2_1$Prelude__Strings__StrCons("<tr >  <td scope=\"row\"> %s </td>   <td>%s</td> <td %s> %d </td>  <td>%s </td> <td>STE20</td> <td>%d</td> <td>0</td>     </tr>".slice(1)[0], "<tr >  <td scope=\"row\"> %s </td>   <td>%s</td> <td %s> %d </td>  <td>%s </td> <td>STE20</td> <td>%d</td> <td>0</td>     </tr>".slice(1).slice(1));
            }
            
            $cg$5 = new $HC_2_1$Prelude__List___58__58_("<tr >  <td scope=\"row\"> %s </td>   <td>%s</td> <td %s> %d </td>  <td>%s </td> <td>STE20</td> <td>%d</td> <td>0</td>     </tr>"[0], _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$7));
        }
        
        let $cg$8 = null;
        if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0(true, true).type === 1)) {
            $cg$8 = $HC_0_0$Prelude__List__Nil;
        } else {
            let $cg$9 = null;
            if(((((" id=\"%s\" ".slice(1) == "")) ? 1|0 : 0|0) === 0)) {
                $cg$9 = true;
            } else {
                $cg$9 = false;
            }
            
            let $cg$10 = null;
            if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$9, true).type === 1)) {
                $cg$10 = $HC_0_0$Prelude__Strings__StrNil;
            } else {
                $cg$10 = new $HC_2_1$Prelude__Strings__StrCons(" id=\"%s\" ".slice(1)[0], " id=\"%s\" ".slice(1).slice(1));
            }
            
            $cg$8 = new $HC_2_1$Prelude__List___58__58_(" id=\"%s\" "[0], _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$10));
        }
        
        return Printf__toFunction(Printf__format($cg$5), "")($_0_arg)("\n     <div class=\"form-group\">\n         <input type=\"number\" class=\"form-control\" placeholder=\"enter \">\n     </div>\n")(Printf__toFunction(Printf__format($cg$8), "")($_1_arg.$1))($_2_arg)("\n   <div class=\"dropdown\">\n       <button class=\"btn btn-secondary dropdown-toggle\" type=\"button\" id=\"dropdown\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\">Unit</button>\n       <div class=\"dropdown-menu\" aria-labelledby=\"dropdown\">\n           <a class=\"dropdown-item\" href=\"#\">Unit</a>\n           <a class=\"dropdown-item\" href=\"#\">m^2</a>\n       </div>  \n   </div>\n")($_3_arg);
    } else {
        let $cg$2 = null;
        if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0(true, true).type === 1)) {
            $cg$2 = $HC_0_0$Prelude__List__Nil;
        } else {
            let $cg$3 = null;
            if((((("<tr >  <td scope=\"row\"> %s </td>   <td>%s</td> <td %s> %d </td>  <td>%s </td> <td>STE20</td> <td>%d</td> <td>0</td>     </tr>".slice(1) == "")) ? 1|0 : 0|0) === 0)) {
                $cg$3 = true;
            } else {
                $cg$3 = false;
            }
            
            let $cg$4 = null;
            if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$3, true).type === 1)) {
                $cg$4 = $HC_0_0$Prelude__Strings__StrNil;
            } else {
                $cg$4 = new $HC_2_1$Prelude__Strings__StrCons("<tr >  <td scope=\"row\"> %s </td>   <td>%s</td> <td %s> %d </td>  <td>%s </td> <td>STE20</td> <td>%d</td> <td>0</td>     </tr>".slice(1)[0], "<tr >  <td scope=\"row\"> %s </td>   <td>%s</td> <td %s> %d </td>  <td>%s </td> <td>STE20</td> <td>%d</td> <td>0</td>     </tr>".slice(1).slice(1));
            }
            
            $cg$2 = new $HC_2_1$Prelude__List___58__58_("<tr >  <td scope=\"row\"> %s </td>   <td>%s</td> <td %s> %d </td>  <td>%s </td> <td>STE20</td> <td>%d</td> <td>0</td>     </tr>"[0], _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$4));
        }
        
        return Printf__toFunction(Printf__format($cg$2), "")($_0_arg)("\n     <div class=\"form-group\">\n         <input type=\"number\" class=\"form-control\" placeholder=\"enter \">\n     </div>\n")("")($_2_arg)("\n   <div class=\"dropdown\">\n       <button class=\"btn btn-secondary dropdown-toggle\" type=\"button\" id=\"dropdown\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\">Unit</button>\n       <div class=\"dropdown-menu\" aria-labelledby=\"dropdown\">\n           <a class=\"dropdown-item\" href=\"#\">Unit</a>\n           <a class=\"dropdown-item\" href=\"#\">m^2</a>\n       </div>  \n   </div>\n")($_3_arg);
    }
}

// Prelude.List.nonEmpty

function Prelude__List__nonEmpty($_0_arg, $_1_arg){
    
    if(($_1_arg.type === 1)) {
        return $HC_0_0$Prelude__Basics__Yes;
    } else {
        return $HC_0_1$Prelude__Basics__No;
    }
}

// Language.JSON.Lexer.numberLit

function Language__JSON__Lexer__numberLit(){
    return new $HC_2_4$Text__Lexer__Core__SeqEat(new $HC_2_4$Text__Lexer__Core__SeqEat(new $HC_2_5$Text__Lexer__Core__SeqEmpty(new $HC_2_6$Text__Lexer__Core__Alt(new $HC_1_3$Text__Lexer__Core__Pred($partial_0_1$Language__JSON__Lexer___123_numberLit_95_62_125_()), $HC_0_0$Text__Lexer__Core__Empty), new $HC_2_6$Text__Lexer__Core__Alt(new $HC_1_3$Text__Lexer__Core__Pred($partial_0_1$Language__JSON__Lexer___123_numberLit_95_63_125_()), new $HC_2_4$Text__Lexer__Core__SeqEat(Text__Lexer__range("1", "9"), new $JSRTS.Lazy((function(){
        return (function(){
            return Text__Lexer___123_digits_95_20_125_();
        })();
    }))))), new $JSRTS.Lazy((function(){
        return (function(){
            return Language__JSON__Lexer___123_numberLit_95_68_125_();
        })();
    }))), new $JSRTS.Lazy((function(){
        return (function(){
            return Language__JSON__Lexer___123_numberLit_95_73_125_();
        })();
    })));
}

// Language.JSON.Parser.object

function Language__JSON__Parser__object(){
    return new $HC_3_6$Text__Parser__Core__SeqEat(true, PE_95_match_95_44e5df34(new $HC_1_4$Language__JSON__Tokens__JTPunct(new $HC_1_3$Language__JSON__Tokens__Curly($HC_0_0$Language__JSON__Tokens__Open))), new $JSRTS.Lazy((function(){
        return (function(){
            return Language__JSON__Parser___123_object_95_79_125_();
        })();
    })));
}

// Text.Parser.option

function Text__Parser__option($_0_arg, $_1_arg, $_2_arg, $_3_arg, $_4_arg){
    
    if($_2_arg) {
        return new $HC_4_8$Text__Parser__Core__Alt(true, false, $_4_arg, new $HC_1_0$Text__Parser__Core__Empty($_3_arg));
    } else {
        return new $HC_4_8$Text__Parser__Core__Alt(false, false, $_4_arg, new $HC_1_0$Text__Parser__Core__Empty($_3_arg));
    }
}

// Text.Parser.Core.parse

function Text__Parser__Core__parse($_0_arg, $_1_arg, $_2_arg, $_3_arg, $_4_arg){
    const $cg$2 = Text__Parser__Core__doParse(null, null, $_2_arg, false, $_4_arg, $_3_arg);
    if(($cg$2.type === 1)) {
        return new $HC_1_1$Prelude__Either__Right(new $HC_2_0$Builtins__MkPair($cg$2.$2, $_4_arg));
    } else if(($cg$2.type === 0)) {
        return new $HC_1_0$Prelude__Either__Left($HC_0_0$Text__Parser__Core__Error);
    } else {
        return new $HC_1_1$Prelude__Either__Right(new $HC_2_0$Builtins__MkPair($cg$2.$3, $cg$2.$4));
    }
}

// Language.JSON.Parser.parseJSON

function Language__JSON__Parser__parseJSON($_0_arg){
    const $cg$2 = Text__Parser__Core__parse(null, null, true, Language__JSON__Parser__json(), Prelude__List__filter(null, $partial_0_1$Language__JSON__Parser___123_parseJSON_95_80_125_(), $_0_arg));
    if(($cg$2.type === 1)) {
        const $cg$4 = $cg$2.$1;
        
        if(($cg$4.$2.type === 0)) {
            return new $HC_1_1$Prelude__Maybe__Just($cg$4.$1);
        } else {
            return $HC_0_0$Prelude__Maybe__Nothing;
        }
    } else {
        return $HC_0_0$Prelude__Maybe__Nothing;
    }
}

// Language.JSON.String.Parser.parseString

function Language__JSON__String__Parser__parseString($_0_arg){
    const $cg$2 = Text__Parser__Core__parse(null, null, true, Language__JSON__String__Parser__quotedString(), $_0_arg);
    if(($cg$2.type === 1)) {
        const $cg$4 = $cg$2.$1;
        
        if(($cg$4.$2.type === 0)) {
            return new $HC_1_1$Prelude__Maybe__Just($cg$4.$1);
        } else {
            return $HC_0_0$Prelude__Maybe__Nothing;
        }
    } else {
        return $HC_0_0$Prelude__Maybe__Nothing;
    }
}

// Language.JSON.String.permissiveStringLit

function Language__JSON__String__permissiveStringLit(){
    return new $HC_2_4$Text__Lexer__Core__SeqEat(new $HC_2_4$Text__Lexer__Core__SeqEat(new $HC_1_3$Text__Lexer__Core__Pred($partial_0_1$Language__JSON__String__Lexer___123_jsonStringTokenMap_95_39_125_()), new $JSRTS.Lazy((function(){
        return (function(){
            return Language__JSON__String___123_permissiveStringLit_95_87_125_();
        })();
    }))), new $JSRTS.Lazy((function(){
        return (function(){
            return Language__JSON__String___123_permissiveStringLit_95_89_125_();
        })();
    })));
}

// Prelude.Show.primNumShow

function Prelude__Show__primNumShow($_0_arg, $_1_arg, $_2_arg, $_3_arg){
    const $_4_in = $_1_arg($_3_arg);
    let $cg$1 = null;
    $cg$1 = (new $JSRTS.jsbn.BigInteger(("0")));
    let $cg$2 = null;
    if((Prelude__Interfaces__Prelude__Interfaces___64_Prelude__Interfaces__Ord_36_Integer_58__33_compare_58_0($cg$1, (new $JSRTS.jsbn.BigInteger(("5")))) > 0)) {
        $cg$2 = true;
    } else {
        let $cg$3 = null;
        $cg$3 = (new $JSRTS.jsbn.BigInteger(("0")));
        $cg$2 = $cg$3.equals((new $JSRTS.jsbn.BigInteger(("5"))));
    }
    
    let $cg$4 = null;
    if($cg$2) {
        let $cg$5 = null;
        if((((($_4_in == "")) ? 1|0 : 0|0) === 0)) {
            $cg$5 = true;
        } else {
            $cg$5 = false;
        }
        
        
        if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$5, true).type === 1)) {
            $cg$4 = false;
        } else {
            $cg$4 = ($_4_in[0] === "-");
        }
    } else {
        $cg$4 = false;
    }
    
    
    if($cg$4) {
        return ("(" + ($_4_in + ")"));
    } else {
        return $_4_in;
    }
}

// Language.JSON.String.Parser.quotedString

function Language__JSON__String__Parser__quotedString(){
    const $_0_in = PE_95_match_95_3b7ca742($HC_0_0$Language__JSON__String__Tokens__JSTQuote);
    return new $HC_3_6$Text__Parser__Core__SeqEat(false, Text__Parser__Core___60__42_(null, true, true, null, null, Text__Parser__Core___42__62_(null, false, true, null, null, $_0_in, Text__Parser__option(null, null, true, $HC_0_0$Prelude__List__Nil, Text__Parser__some(null, null, new $HC_4_8$Text__Parser__Core__Alt(true, true, PE_95_match_95_3b7ca742($HC_0_1$Language__JSON__String__Tokens__JSTChar), new $HC_4_8$Text__Parser__Core__Alt(true, true, PE_95_match_95_3b7ca742($HC_0_2$Language__JSON__String__Tokens__JSTSimpleEscape), PE_95_match_95_3b7ca742($HC_0_3$Language__JSON__String__Tokens__JSTUnicodeEscape)))))), $_0_in), new $JSRTS.Lazy((function(){
        return (function(){
            return Language__JSON__String__Parser___123_quotedString_95_92_125_();
        })();
    })));
}

// Text.Lexer.range

function Text__Lexer__range($_0_arg, $_1_arg){
    return new $HC_1_3$Text__Lexer__Core__Pred($partial_2_3$Text__Lexer___123_range_95_93_125_($_0_arg, $_1_arg));
}

// Language.JSON.Parser.rawString

function Language__JSON__Parser__rawString(){
    return new $HC_3_6$Text__Parser__Core__SeqEat(false, PE_95_match_95_44e5df34($HC_0_2$Language__JSON__Tokens__JTString), new $JSRTS.Lazy((function(){
        return (function(){
            return Language__JSON__Parser___123_rawString_95_95_125_();
        })();
    })));
}

// Main.remove_row

function Main__remove_95_row($_0_x, $_1_w){
    return (remove_row(($_0_x)));
}

// Prelude.List.replicate

function Prelude__List__replicate($_0_arg, $_1_arg, $_2_arg){
    
    if($_1_arg.equals((new $JSRTS.jsbn.BigInteger(("0"))))) {
        return $HC_0_0$Prelude__List__Nil;
    } else {
        const $_3_in = $_1_arg.subtract((new $JSRTS.jsbn.BigInteger(("1"))));
        return new $HC_2_1$Prelude__List___58__58_($_2_arg, Prelude__List__replicate(null, $_3_in, $_2_arg));
    }
}

// Prelude.List.reverseOnto

function Prelude__List__reverseOnto($_0_arg, $_1_arg, $_2_arg){
    for(;;) {
        
        if(($_2_arg.type === 1)) {
            $_0_arg = null;
            $_1_arg = new $HC_2_1$Prelude__List___58__58_($_2_arg.$1, $_1_arg);
            $_2_arg = $_2_arg.$2;
        } else {
            return $_1_arg;
        }
    }
}

// Text.Lexer.Core.scan

function Text__Lexer__Core__scan($_0_arg, $_1_arg, $_2_arg, $_3_arg){
    for(;;) {
        
        if(($_1_arg.type === 6)) {
            const $cg$11 = Text__Lexer__Core__scan(null, $_1_arg.$1, $_2_arg, $_3_arg);
            if(($cg$11.type === 1)) {
                return new $HC_1_1$Prelude__Maybe__Just($cg$11.$1);
            } else {
                $_0_arg = null;
                $_1_arg = $_1_arg.$2;
                $_2_arg = $_2_arg;
                $_3_arg = $_3_arg;
            }
        } else if(($_1_arg.type === 0)) {
            return new $HC_1_1$Prelude__Maybe__Just($_2_arg);
        } else if(($_1_arg.type === 1)) {
            return $HC_0_0$Prelude__Maybe__Nothing;
        } else if(($_1_arg.type === 2)) {
            
            if(Prelude__Interfaces__Prelude__Interfaces___64_Prelude__Interfaces__Eq_36_Bool_58__33__61__61__58_0((!(!(Text__Lexer__Core__scan(null, $_1_arg.$2, $_2_arg, $_3_arg).type === 1))), $_1_arg.$1)) {
                return new $HC_1_1$Prelude__Maybe__Just($_2_arg);
            } else {
                return $HC_0_0$Prelude__Maybe__Nothing;
            }
        } else if(($_1_arg.type === 3)) {
            const $cg$7 = Text__Lexer__Core__strIndex($_3_arg, $_2_arg);
            if(($cg$7.type === 1)) {
                
                if($_1_arg.$1($cg$7.$1)) {
                    return new $HC_1_1$Prelude__Maybe__Just($_2_arg.add((new $JSRTS.jsbn.BigInteger(("1")))));
                } else {
                    return $HC_0_0$Prelude__Maybe__Nothing;
                }
            } else {
                return $HC_0_0$Prelude__Maybe__Nothing;
            }
        } else if(($_1_arg.type === 4)) {
            const $cg$5 = Text__Lexer__Core__scan(null, $_1_arg.$1, $_2_arg, $_3_arg);
            if(($cg$5.type === 1)) {
                $_0_arg = null;
                $_1_arg = $JSRTS.force($_1_arg.$2);
                $_2_arg = $cg$5.$1;
                $_3_arg = $_3_arg;
            } else {
                return $HC_0_0$Prelude__Maybe__Nothing;
            }
        } else {
            const $cg$3 = Text__Lexer__Core__scan(null, $_1_arg.$1, $_2_arg, $_3_arg);
            if(($cg$3.type === 1)) {
                $_0_arg = null;
                $_1_arg = $_1_arg.$2;
                $_2_arg = $cg$3.$1;
                $_3_arg = $_3_arg;
            } else {
                return $HC_0_0$Prelude__Maybe__Nothing;
            }
        }
    }
}

// Text.Parser.sepBy1

function Text__Parser__sepBy1($_0_arg, $_1_arg, $_2_arg, $_3_arg, $_4_arg, $_5_arg){
    return new $HC_4_7$Text__Parser__Core__SeqEmpty($_3_arg, false, new $HC_4_7$Text__Parser__Core__SeqEmpty(false, $_3_arg, new $HC_1_0$Text__Parser__Core__Empty($partial_0_2$Text__Parser___123_sepBy1_95_96_125_()), $partial_2_3$Text__Parser__Core___123__42__62__95_1_125_($_3_arg, $_5_arg)), $partial_3_4$Text__Parser___123_sepBy1_95_98_125_($_3_arg, $_4_arg, $_5_arg));
}

// Text.Parser.Core.shorter

function Text__Parser__Core__shorter($_0_arg, $_1_arg, $_2_arg){
    
    if(($_2_arg.type === 1)) {
        return $HC_0_1$Prelude__Nat__LTESucc;
    } else {
        return Prelude__Nat__lteRefl(Prelude__List__length(null, $_1_arg).add((new $JSRTS.jsbn.BigInteger(("1")))));
    }
}

// Language.JSON.Data.showChar

function Language__JSON__Data__showChar($_0_arg){
    
    if(($_0_arg === "\b")) {
        return "\\b";
    } else if(($_0_arg === "\t")) {
        return "\\t";
    } else if(($_0_arg === "\n")) {
        return "\\n";
    } else if(($_0_arg === "\f")) {
        return "\\f";
    } else if(($_0_arg === "\r")) {
        return "\\r";
    } else if(($_0_arg === "\"")) {
        return "\\\"";
    } else if(($_0_arg === "\\")) {
        return "\\\\";
    } else {
        let $cg$2 = null;
        if(Prelude__Chars__isControl($_0_arg)) {
            $cg$2 = true;
        } else {
            
            if((Prelude__Interfaces__Prelude__Interfaces___64_Prelude__Interfaces__Ord_36_Char_58__33_compare_58_0($_0_arg, "\x7f") > 0)) {
                $cg$2 = true;
            } else {
                $cg$2 = ($_0_arg === "\x7f");
            }
        }
        
        
        if($cg$2) {
            return ("\\u" + Prelude__Bits__b16ToHexString((((new $JSRTS.jsbn.BigInteger(''+((($_0_arg).charCodeAt(0)|0))))).intValue() & 0xFFFF)));
        } else {
            return (($_0_arg)+(""));
        }
    }
}

// Language.JSON.Data.showString

function Language__JSON__Data__showString($_0_arg){
    let $cg$1 = null;
    if((((($_0_arg == "")) ? 1|0 : 0|0) === 0)) {
        $cg$1 = true;
    } else {
        $cg$1 = false;
    }
    
    let $cg$2 = null;
    if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$1, true).type === 1)) {
        $cg$2 = $HC_0_0$Prelude__List__Nil;
    } else {
        let $cg$3 = null;
        if((((($_0_arg.slice(1) == "")) ? 1|0 : 0|0) === 0)) {
            $cg$3 = true;
        } else {
            $cg$3 = false;
        }
        
        let $cg$4 = null;
        if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$3, true).type === 1)) {
            $cg$4 = $HC_0_0$Prelude__Strings__StrNil;
        } else {
            $cg$4 = new $HC_2_1$Prelude__Strings__StrCons($_0_arg.slice(1)[0], $_0_arg.slice(1).slice(1));
        }
        
        $cg$2 = new $HC_2_1$Prelude__List___58__58_($_0_arg[0], _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$4));
    }
    
    return ("\"" + (Prelude__Foldable__Prelude__List___64_Prelude__Foldable__Foldable_36_List_58__33_foldr_58_0(null, null, $partial_0_2$Language__JSON__Data___123_showString_95_99_125_(), "", $cg$2) + "\""));
}

// Language.JSON.String.Lexer.simpleEscape

function Language__JSON__String__Lexer__simpleEscape(){
    return new $HC_2_4$Text__Lexer__Core__SeqEat(new $HC_1_3$Text__Lexer__Core__Pred($partial_0_1$Language__JSON__String__Lexer___123_legalChar_95_51_125_()), new $JSRTS.Lazy((function(){
        return (function(){
            return Language__JSON__String__Lexer___123_simpleEscape_95_102_125_();
        })();
    })));
}

// Language.JSON.String.Tokens.simpleEscapeValue

function Language__JSON__String__Tokens__simpleEscapeValue($_0_arg){
    let $cg$1 = null;
    if((((($_0_arg == "")) ? 1|0 : 0|0) === 0)) {
        $cg$1 = true;
    } else {
        $cg$1 = false;
    }
    
    let $cg$2 = null;
    if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$1, true).type === 1)) {
        $cg$2 = $HC_0_0$Prelude__Maybe__Nothing;
    } else {
        const $_18_in = (new $JSRTS.jsbn.BigInteger(("1"))).subtract((new $JSRTS.jsbn.BigInteger(("1"))));
        let $cg$3 = null;
        if((((($_0_arg.slice(1) == "")) ? 1|0 : 0|0) === 0)) {
            $cg$3 = true;
        } else {
            $cg$3 = false;
        }
        
        
        if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$3, true).type === 1)) {
            $cg$2 = $HC_0_0$Prelude__Maybe__Nothing;
        } else {
            
            if($_18_in.equals((new $JSRTS.jsbn.BigInteger(("0"))))) {
                $cg$2 = new $HC_1_1$Prelude__Maybe__Just($_0_arg.slice(1)[0]);
            } else {
                const $_21_in = $_18_in.subtract((new $JSRTS.jsbn.BigInteger(("1"))));
                let $cg$6 = null;
                if((((($_0_arg.slice(1).slice(1) == "")) ? 1|0 : 0|0) === 0)) {
                    $cg$6 = true;
                } else {
                    $cg$6 = false;
                }
                
                let $cg$7 = null;
                if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$6, true).type === 1)) {
                    $cg$7 = $HC_0_0$Prelude__List__Nil;
                } else {
                    let $cg$8 = null;
                    if((((($_0_arg.slice(1).slice(1).slice(1) == "")) ? 1|0 : 0|0) === 0)) {
                        $cg$8 = true;
                    } else {
                        $cg$8 = false;
                    }
                    
                    let $cg$9 = null;
                    if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$8, true).type === 1)) {
                        $cg$9 = $HC_0_0$Prelude__Strings__StrNil;
                    } else {
                        $cg$9 = new $HC_2_1$Prelude__Strings__StrCons($_0_arg.slice(1).slice(1).slice(1)[0], $_0_arg.slice(1).slice(1).slice(1).slice(1));
                    }
                    
                    $cg$7 = new $HC_2_1$Prelude__List___58__58_($_0_arg.slice(1).slice(1)[0], _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$9));
                }
                
                $cg$2 = _95_Data__String__Extra__index_95_with_95_18($cg$7, $_21_in, null);
            }
        }
    }
    
    
    if(($cg$2.type === 1)) {
        const $cg$12 = $cg$2.$1;
        if(($cg$12 === "\"")) {
            return "\"";
        } else if(($cg$12 === "/")) {
            return "/";
        } else if(($cg$12 === "\\")) {
            return "\\";
        } else if(($cg$12 === "b")) {
            return "\b";
        } else if(($cg$12 === "f")) {
            return "\f";
        } else if(($cg$12 === "n")) {
            return "\n";
        } else if(($cg$12 === "r")) {
            return "\r";
        } else if(($cg$12 === "t")) {
            return "\t";
        } else {
            return "\x00";
        }
    } else {
        return "\x00";
    }
}

// Text.Parser.some

function Text__Parser__some($_0_arg, $_1_arg, $_2_arg){
    return new $HC_3_6$Text__Parser__Core__SeqEat(false, $_2_arg, new $JSRTS.Lazy((function(){
        return (function(){
            return Text__Parser___123_some_95_105_125_($_2_arg);
        })();
    })));
}

// Text.Lexer.Core.strIndex

function Text__Lexer__Core__strIndex($_0_arg, $_1_arg){
    
    
    if(((((($_1_arg).compareTo(($_0_arg.$2)) >= 0)) ? 1|0 : 0|0) === 0)) {
        return new $HC_1_1$Prelude__Maybe__Just($_0_arg.$1[(($_1_arg).intValue()|0)]);
    } else {
        return $HC_0_0$Prelude__Maybe__Nothing;
    }
}

// Language.JSON.Data.stringify

function Language__JSON__Data__stringify($_0_arg){
    
    if(($_0_arg.type === 4)) {
        return ("[" + (Language__JSON__Data__stringify_58_stringifyValues_58_4(null, $_0_arg.$1) + "]"));
    } else if(($_0_arg.type === 1)) {
        
        if($_0_arg.$1) {
            return "true";
        } else {
            return "false";
        }
    } else if(($_0_arg.type === 0)) {
        return "null";
    } else if(($_0_arg.type === 2)) {
        return Prelude__Show__primNumShow(null, $partial_0_1$prim_95__95_floatToStr(), $HC_0_0$Prelude__Show__Open, $_0_arg.$1);
    } else if(($_0_arg.type === 5)) {
        return ("{" + (Language__JSON__Data__stringify_58_stringifyProps_58_5(null, $_0_arg.$1) + "}"));
    } else {
        return Language__JSON__Data__showString($_0_arg.$1);
    }
}

// Snippets.table_card

function Snippets__table_95_card($_0_arg){
    let $cg$1 = null;
    if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0(true, true).type === 1)) {
        $cg$1 = $HC_0_0$Prelude__List__Nil;
    } else {
        let $cg$2 = null;
        if((((("\n          <!-- Content Edit Table -->\n          <div class=\"card border-dark bg-light mt-3\">\n              <div class=\"card-header\">\n              <h4>%s</h4>\n              </div>\n            <div class=\"card-body\">\n              \n              <form>\n              <table class=\"table table-responsive d-md-table\">\n                <thead>\n                  <tr>\n                    <th>SKU</th>\n\t\t    <th>Description</th>\n                    <th>Qty</th>\n                    <th>Unit</th>\n                    <th>Taxes</th>\n                    <th>Price</th>\n\t\t    <th>Disc</th>\n                  </tr>\n                </thead>\n                <tbody %s >\n                </tbody>\n                \n              </table>\n              <div class=\"card-footer\">\n              <button type=\"submit\" class=\"btn btn-primary\">Submit</button>\n              <div/>\n              </form>\n            </div>\n          </div>  <!-- /.card -->\n".slice(1) == "")) ? 1|0 : 0|0) === 0)) {
            $cg$2 = true;
        } else {
            $cg$2 = false;
        }
        
        let $cg$3 = null;
        if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$2, true).type === 1)) {
            $cg$3 = $HC_0_0$Prelude__Strings__StrNil;
        } else {
            $cg$3 = new $HC_2_1$Prelude__Strings__StrCons("\n          <!-- Content Edit Table -->\n          <div class=\"card border-dark bg-light mt-3\">\n              <div class=\"card-header\">\n              <h4>%s</h4>\n              </div>\n            <div class=\"card-body\">\n              \n              <form>\n              <table class=\"table table-responsive d-md-table\">\n                <thead>\n                  <tr>\n                    <th>SKU</th>\n\t\t    <th>Description</th>\n                    <th>Qty</th>\n                    <th>Unit</th>\n                    <th>Taxes</th>\n                    <th>Price</th>\n\t\t    <th>Disc</th>\n                  </tr>\n                </thead>\n                <tbody %s >\n                </tbody>\n                \n              </table>\n              <div class=\"card-footer\">\n              <button type=\"submit\" class=\"btn btn-primary\">Submit</button>\n              <div/>\n              </form>\n            </div>\n          </div>  <!-- /.card -->\n".slice(1)[0], "\n          <!-- Content Edit Table -->\n          <div class=\"card border-dark bg-light mt-3\">\n              <div class=\"card-header\">\n              <h4>%s</h4>\n              </div>\n            <div class=\"card-body\">\n              \n              <form>\n              <table class=\"table table-responsive d-md-table\">\n                <thead>\n                  <tr>\n                    <th>SKU</th>\n\t\t    <th>Description</th>\n                    <th>Qty</th>\n                    <th>Unit</th>\n                    <th>Taxes</th>\n                    <th>Price</th>\n\t\t    <th>Disc</th>\n                  </tr>\n                </thead>\n                <tbody %s >\n                </tbody>\n                \n              </table>\n              <div class=\"card-footer\">\n              <button type=\"submit\" class=\"btn btn-primary\">Submit</button>\n              <div/>\n              </form>\n            </div>\n          </div>  <!-- /.card -->\n".slice(1).slice(1));
        }
        
        $cg$1 = new $HC_2_1$Prelude__List___58__58_("\n          <!-- Content Edit Table -->\n          <div class=\"card border-dark bg-light mt-3\">\n              <div class=\"card-header\">\n              <h4>%s</h4>\n              </div>\n            <div class=\"card-body\">\n              \n              <form>\n              <table class=\"table table-responsive d-md-table\">\n                <thead>\n                  <tr>\n                    <th>SKU</th>\n\t\t    <th>Description</th>\n                    <th>Qty</th>\n                    <th>Unit</th>\n                    <th>Taxes</th>\n                    <th>Price</th>\n\t\t    <th>Disc</th>\n                  </tr>\n                </thead>\n                <tbody %s >\n                </tbody>\n                \n              </table>\n              <div class=\"card-footer\">\n              <button type=\"submit\" class=\"btn btn-primary\">Submit</button>\n              <div/>\n              </form>\n            </div>\n          </div>  <!-- /.card -->\n"[0], _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$3));
    }
    
    let $cg$4 = null;
    if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0(true, true).type === 1)) {
        $cg$4 = $HC_0_0$Prelude__List__Nil;
    } else {
        let $cg$5 = null;
        if(((((" id=\"%s\" ".slice(1) == "")) ? 1|0 : 0|0) === 0)) {
            $cg$5 = true;
        } else {
            $cg$5 = false;
        }
        
        let $cg$6 = null;
        if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$5, true).type === 1)) {
            $cg$6 = $HC_0_0$Prelude__Strings__StrNil;
        } else {
            $cg$6 = new $HC_2_1$Prelude__Strings__StrCons(" id=\"%s\" ".slice(1)[0], " id=\"%s\" ".slice(1).slice(1));
        }
        
        $cg$4 = new $HC_2_1$Prelude__List___58__58_(" id=\"%s\" "[0], _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$6));
    }
    
    return Printf__toFunction(Printf__format($cg$1), "")("SO440")(Printf__toFunction(Printf__format($cg$4), "")($_0_arg));
}

// Text.Lexer.Core.takeToken

function Text__Lexer__Core__takeToken($_0_arg, $_1_arg){
    const $cg$2 = Text__Lexer__Core__scan(null, $_0_arg, (new $JSRTS.jsbn.BigInteger(("0"))), $_1_arg);
    if(($cg$2.type === 1)) {
        let $cg$3 = null;
        $cg$3 = $_1_arg.$1;
        let $cg$4 = null;
        $cg$4 = new $HC_2_0$Text__Lexer__Core__MkStrLen(($JSRTS.prim_strSubstr(((($cg$2.$1).intValue()|0)), ((($_1_arg.$2).intValue()|0)), ($_1_arg.$1))), Prelude__Nat__minus($_1_arg.$2, $cg$2.$1));
        return new $HC_1_1$Prelude__Maybe__Just(new $HC_2_0$Builtins__MkPair(($JSRTS.prim_strSubstr((0), ((($cg$2.$1).intValue()|0)), ($cg$3))), $cg$4));
    } else {
        return $HC_0_0$Prelude__Maybe__Nothing;
    }
}

// Main.test_list

function Main__test_95_list(){
    return new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$Exchange__MkOrderLine(new $HC_6_0$Exchange__MkOrderLineKey((new $JSRTS.jsbn.BigInteger(("1"))), (new $JSRTS.jsbn.BigInteger(("7"))), (new $JSRTS.jsbn.BigInteger(("1"))), (new $JSRTS.jsbn.BigInteger(("1"))), (new $JSRTS.jsbn.BigInteger(("100"))), (new $JSRTS.jsbn.BigInteger(("188")))), new $HC_2_0$Exchange__Tt((new $JSRTS.jsbn.BigInteger(("15"))), (new $JSRTS.jsbn.BigInteger(("0"))))), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$Exchange__MkOrderLine(new $HC_6_0$Exchange__MkOrderLineKey((new $JSRTS.jsbn.BigInteger(("1"))), (new $JSRTS.jsbn.BigInteger(("7"))), (new $JSRTS.jsbn.BigInteger(("1"))), (new $JSRTS.jsbn.BigInteger(("2"))), (new $JSRTS.jsbn.BigInteger(("100"))), (new $JSRTS.jsbn.BigInteger(("73")))), new $HC_2_0$Exchange__Tt((new $JSRTS.jsbn.BigInteger(("5"))), (new $JSRTS.jsbn.BigInteger(("0"))))), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$Exchange__MkOrderLine(new $HC_6_0$Exchange__MkOrderLineKey((new $JSRTS.jsbn.BigInteger(("1"))), (new $JSRTS.jsbn.BigInteger(("7"))), (new $JSRTS.jsbn.BigInteger(("1"))), (new $JSRTS.jsbn.BigInteger(("1"))), (new $JSRTS.jsbn.BigInteger(("100"))), (new $JSRTS.jsbn.BigInteger(("188")))), new $HC_2_0$Exchange__Tt((new $JSRTS.jsbn.BigInteger(("0"))), (new $JSRTS.jsbn.BigInteger(("2"))))), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$Exchange__MkOrderLine(new $HC_6_0$Exchange__MkOrderLineKey((new $JSRTS.jsbn.BigInteger(("1"))), (new $JSRTS.jsbn.BigInteger(("7"))), (new $JSRTS.jsbn.BigInteger(("1"))), (new $JSRTS.jsbn.BigInteger(("1"))), (new $JSRTS.jsbn.BigInteger(("100"))), (new $JSRTS.jsbn.BigInteger(("188")))), new $HC_2_0$Exchange__Tt((new $JSRTS.jsbn.BigInteger(("0"))), (new $JSRTS.jsbn.BigInteger(("1"))))), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$Exchange__MkOrderLine(new $HC_6_0$Exchange__MkOrderLineKey((new $JSRTS.jsbn.BigInteger(("1"))), (new $JSRTS.jsbn.BigInteger(("7"))), (new $JSRTS.jsbn.BigInteger(("1"))), (new $JSRTS.jsbn.BigInteger(("3"))), (new $JSRTS.jsbn.BigInteger(("100"))), (new $JSRTS.jsbn.BigInteger(("93")))), new $HC_2_0$Exchange__Tt((new $JSRTS.jsbn.BigInteger(("3"))), (new $JSRTS.jsbn.BigInteger(("0"))))), $HC_0_0$Prelude__List__Nil)))));
}

// Main.test_list2

function Main__test_95_list2(){
    return new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$Exchange__MkOrderLine(new $HC_6_0$Exchange__MkOrderLineKey((new $JSRTS.jsbn.BigInteger(("1"))), (new $JSRTS.jsbn.BigInteger(("7"))), (new $JSRTS.jsbn.BigInteger(("1"))), (new $JSRTS.jsbn.BigInteger(("1"))), (new $JSRTS.jsbn.BigInteger(("100"))), (new $JSRTS.jsbn.BigInteger(("188")))), new $HC_2_0$Exchange__Tt((new $JSRTS.jsbn.BigInteger(("0"))), (new $JSRTS.jsbn.BigInteger(("3"))))), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$Exchange__MkOrderLine(new $HC_6_0$Exchange__MkOrderLineKey((new $JSRTS.jsbn.BigInteger(("1"))), (new $JSRTS.jsbn.BigInteger(("7"))), (new $JSRTS.jsbn.BigInteger(("1"))), (new $JSRTS.jsbn.BigInteger(("2"))), (new $JSRTS.jsbn.BigInteger(("100"))), (new $JSRTS.jsbn.BigInteger(("73")))), new $HC_2_0$Exchange__Tt((new $JSRTS.jsbn.BigInteger(("3"))), (new $JSRTS.jsbn.BigInteger(("0"))))), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$Exchange__MkOrderLine(new $HC_6_0$Exchange__MkOrderLineKey((new $JSRTS.jsbn.BigInteger(("1"))), (new $JSRTS.jsbn.BigInteger(("7"))), (new $JSRTS.jsbn.BigInteger(("1"))), (new $JSRTS.jsbn.BigInteger(("3"))), (new $JSRTS.jsbn.BigInteger(("100"))), (new $JSRTS.jsbn.BigInteger(("93")))), new $HC_2_0$Exchange__Tt((new $JSRTS.jsbn.BigInteger(("0"))), (new $JSRTS.jsbn.BigInteger(("1"))))), $HC_0_0$Prelude__List__Nil)));
}

// Main.test_list3

function Main__test_95_list3(){
    return new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$Exchange__MkOrderLine(new $HC_6_0$Exchange__MkOrderLineKey((new $JSRTS.jsbn.BigInteger(("1"))), (new $JSRTS.jsbn.BigInteger(("7"))), (new $JSRTS.jsbn.BigInteger(("1"))), (new $JSRTS.jsbn.BigInteger(("2"))), (new $JSRTS.jsbn.BigInteger(("100"))), (new $JSRTS.jsbn.BigInteger(("73")))), new $HC_2_0$Exchange__Tt((new $JSRTS.jsbn.BigInteger(("0"))), (new $JSRTS.jsbn.BigInteger(("1"))))), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$Exchange__MkOrderLine(new $HC_6_0$Exchange__MkOrderLineKey((new $JSRTS.jsbn.BigInteger(("1"))), (new $JSRTS.jsbn.BigInteger(("7"))), (new $JSRTS.jsbn.BigInteger(("1"))), (new $JSRTS.jsbn.BigInteger(("3"))), (new $JSRTS.jsbn.BigInteger(("100"))), (new $JSRTS.jsbn.BigInteger(("93")))), new $HC_2_0$Exchange__Tt((new $JSRTS.jsbn.BigInteger(("0"))), (new $JSRTS.jsbn.BigInteger(("2"))))), $HC_0_0$Prelude__List__Nil));
}

// Main.test_list4

function Main__test_95_list4(){
    return new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$Exchange__MkOrderLine(new $HC_6_0$Exchange__MkOrderLineKey((new $JSRTS.jsbn.BigInteger(("1"))), (new $JSRTS.jsbn.BigInteger(("7"))), (new $JSRTS.jsbn.BigInteger(("1"))), (new $JSRTS.jsbn.BigInteger(("2"))), (new $JSRTS.jsbn.BigInteger(("100"))), (new $JSRTS.jsbn.BigInteger(("73")))), new $HC_2_0$Exchange__Tt((new $JSRTS.jsbn.BigInteger(("0"))), (new $JSRTS.jsbn.BigInteger(("1"))))), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$Exchange__MkOrderLine(new $HC_6_0$Exchange__MkOrderLineKey((new $JSRTS.jsbn.BigInteger(("1"))), (new $JSRTS.jsbn.BigInteger(("7"))), (new $JSRTS.jsbn.BigInteger(("1"))), (new $JSRTS.jsbn.BigInteger(("4"))), (new $JSRTS.jsbn.BigInteger(("100"))), (new $JSRTS.jsbn.BigInteger(("93")))), new $HC_2_0$Exchange__Tt((new $JSRTS.jsbn.BigInteger(("1"))), (new $JSRTS.jsbn.BigInteger(("0"))))), $HC_0_0$Prelude__List__Nil));
}

// Printf.toFunction

function Printf__toFunction($_0_arg, $_1_arg){
    let $tco$$_1_arg = $_1_arg;
    for(;;) {
        
        if(($_0_arg.type === 3)) {
            return $_1_arg;
        } else if(($_0_arg.type === 0)) {
            return $partial_2_3$Printf___123_toFunction_95_107_125_($_0_arg.$1, $_1_arg);
        } else if(($_0_arg.type === 2)) {
            $tco$$_1_arg = ($_1_arg + (($_0_arg.$1)+("")));
            $_0_arg = $_0_arg.$2;
            $_1_arg = $tco$$_1_arg;
        } else {
            return $partial_2_3$Printf___123_toFunction_95_108_125_($_0_arg.$1, $_1_arg);
        }
    }
}

// Data.SortedMap.toList

function Data__SortedMap__toList($_0_arg, $_1_arg, $_2_arg){
    
    if(($_2_arg.type === 0)) {
        return $HC_0_0$Prelude__List__Nil;
    } else {
        return Data__SortedMap__treeToList_58_treeToList_39__58_0(null, null, null, null, null, $partial_0_1$Data__SortedMap___123_toList_95_109_125_(), $_2_arg.$2);
    }
}

// Text.Lexer.toTokenMap

function Text__Lexer__toTokenMap($_0_arg, $_1_arg){
    return Prelude__Functor__Prelude__List___64_Prelude__Functor__Functor_36_List_58__33_map_58_0(null, null, $partial_0_1$Text__Lexer___123_toTokenMap_95_111_125_(), $_1_arg);
}

// Text.Lexer.Core.tokenise

function Text__Lexer__Core__tokenise($_0_arg, $_1_arg, $_2_arg, $_3_arg, $_4_arg, $_5_arg){
    for(;;) {
        const $cg$2 = Text__Lexer__Core__tokenise_58_getFirstToken_58_0(null, $_1_arg, $_2_arg, null, null, null, $_4_arg, $_5_arg);
        if(($cg$2.type === 1)) {
            const $cg$4 = $cg$2.$1;
            const $cg$6 = $cg$4.$2;
            const $cg$8 = $cg$6.$2;
            $_0_arg = null;
            $_1_arg = $cg$6.$1;
            $_2_arg = $cg$8.$1;
            $_3_arg = new $HC_2_1$Prelude__List___58__58_($cg$4.$1, $_3_arg);
            $_4_arg = $_4_arg;
            $_5_arg = $cg$8.$2;
        } else {
            return new $HC_2_0$Builtins__MkPair(Prelude__List__reverseOnto(null, $HC_0_0$Prelude__List__Nil, $_3_arg), new $HC_2_0$Builtins__MkPair($_1_arg, new $HC_2_0$Builtins__MkPair($_2_arg, $_5_arg)));
        }
    }
}

// Data.SortedMap.treeInsert

function Data__SortedMap__treeInsert($_0_arg, $_1_arg, $_2_arg, $_3_arg, $_4_arg, $_5_arg, $_6_arg){
    const $cg$2 = Data__SortedMap__treeInsert_39_(null, null, $_2_arg, null, $_4_arg, $_5_arg, $_6_arg);
    if(($cg$2.type === 0)) {
        return new $HC_1_0$Prelude__Either__Left($cg$2.$1);
    } else {
        const $cg$4 = $cg$2.$1;
        const $cg$6 = $cg$4.$2;
        return new $HC_1_1$Prelude__Either__Right(new $HC_3_1$Data__SortedMap__Branch2($cg$4.$1, $cg$6.$1, $cg$6.$2));
    }
}

// Data.SortedMap.treeInsert'

function Data__SortedMap__treeInsert_39_($_0_arg, $_1_arg, $_2_arg, $_3_arg, $_4_arg, $_5_arg, $_6_arg){
    
    if(($_6_arg.type === 1)) {
        
        
        if($_2_arg.$3($_4_arg)($_6_arg.$2)) {
            const $cg$36 = Data__SortedMap__treeInsert_39_(null, null, $_2_arg, null, $_4_arg, $_5_arg, $_6_arg.$1);
            if(($cg$36.type === 0)) {
                return new $HC_1_0$Prelude__Either__Left(new $HC_3_1$Data__SortedMap__Branch2($cg$36.$1, $_6_arg.$2, $_6_arg.$3));
            } else {
                const $cg$38 = $cg$36.$1;
                const $cg$40 = $cg$38.$2;
                return new $HC_1_0$Prelude__Either__Left(new $HC_5_2$Data__SortedMap__Branch3($cg$38.$1, $cg$40.$1, $cg$40.$2, $_6_arg.$2, $_6_arg.$3));
            }
        } else {
            const $cg$30 = Data__SortedMap__treeInsert_39_(null, null, $_2_arg, null, $_4_arg, $_5_arg, $_6_arg.$3);
            if(($cg$30.type === 0)) {
                return new $HC_1_0$Prelude__Either__Left(new $HC_3_1$Data__SortedMap__Branch2($_6_arg.$1, $_6_arg.$2, $cg$30.$1));
            } else {
                const $cg$32 = $cg$30.$1;
                const $cg$34 = $cg$32.$2;
                return new $HC_1_0$Prelude__Either__Left(new $HC_5_2$Data__SortedMap__Branch3($_6_arg.$1, $_6_arg.$2, $cg$32.$1, $cg$34.$1, $cg$34.$2));
            }
        }
    } else if(($_6_arg.type === 2)) {
        
        
        if($_2_arg.$3($_4_arg)($_6_arg.$2)) {
            const $cg$22 = Data__SortedMap__treeInsert_39_(null, null, $_2_arg, null, $_4_arg, $_5_arg, $_6_arg.$1);
            if(($cg$22.type === 0)) {
                return new $HC_1_0$Prelude__Either__Left(new $HC_5_2$Data__SortedMap__Branch3($cg$22.$1, $_6_arg.$2, $_6_arg.$3, $_6_arg.$4, $_6_arg.$5));
            } else {
                const $cg$24 = $cg$22.$1;
                const $cg$26 = $cg$24.$2;
                return new $HC_1_1$Prelude__Either__Right(new $HC_2_0$Builtins__MkPair(new $HC_3_1$Data__SortedMap__Branch2($cg$24.$1, $cg$26.$1, $cg$26.$2), new $HC_2_0$Builtins__MkPair($_6_arg.$2, new $HC_3_1$Data__SortedMap__Branch2($_6_arg.$3, $_6_arg.$4, $_6_arg.$5))));
            }
        } else {
            
            
            if($_2_arg.$3($_4_arg)($_6_arg.$4)) {
                const $cg$16 = Data__SortedMap__treeInsert_39_(null, null, $_2_arg, null, $_4_arg, $_5_arg, $_6_arg.$3);
                if(($cg$16.type === 0)) {
                    return new $HC_1_0$Prelude__Either__Left(new $HC_5_2$Data__SortedMap__Branch3($_6_arg.$1, $_6_arg.$2, $cg$16.$1, $_6_arg.$4, $_6_arg.$5));
                } else {
                    const $cg$18 = $cg$16.$1;
                    const $cg$20 = $cg$18.$2;
                    return new $HC_1_1$Prelude__Either__Right(new $HC_2_0$Builtins__MkPair(new $HC_3_1$Data__SortedMap__Branch2($_6_arg.$1, $_6_arg.$2, $cg$18.$1), new $HC_2_0$Builtins__MkPair($cg$20.$1, new $HC_3_1$Data__SortedMap__Branch2($cg$20.$2, $_6_arg.$4, $_6_arg.$5))));
                }
            } else {
                const $cg$10 = Data__SortedMap__treeInsert_39_(null, null, $_2_arg, null, $_4_arg, $_5_arg, $_6_arg.$5);
                if(($cg$10.type === 0)) {
                    return new $HC_1_0$Prelude__Either__Left(new $HC_5_2$Data__SortedMap__Branch3($_6_arg.$1, $_6_arg.$2, $_6_arg.$3, $_6_arg.$4, $cg$10.$1));
                } else {
                    const $cg$12 = $cg$10.$1;
                    const $cg$14 = $cg$12.$2;
                    return new $HC_1_1$Prelude__Either__Right(new $HC_2_0$Builtins__MkPair(new $HC_3_1$Data__SortedMap__Branch2($_6_arg.$1, $_6_arg.$2, $_6_arg.$3), new $HC_2_0$Builtins__MkPair($_6_arg.$4, new $HC_3_1$Data__SortedMap__Branch2($cg$12.$1, $cg$14.$1, $cg$14.$2))));
                }
            }
        }
    } else {
        
        const $cg$4 = $_2_arg.$2($_4_arg)($_6_arg.$1);
        if(($cg$4 === 0)) {
            return new $HC_1_0$Prelude__Either__Left(new $HC_2_0$Data__SortedMap__Leaf($_4_arg, $_5_arg));
        } else if(($cg$4 > 0)) {
            return new $HC_1_1$Prelude__Either__Right(new $HC_2_0$Builtins__MkPair(new $HC_2_0$Data__SortedMap__Leaf($_6_arg.$1, $_6_arg.$2), new $HC_2_0$Builtins__MkPair($_6_arg.$1, new $HC_2_0$Data__SortedMap__Leaf($_4_arg, $_5_arg))));
        } else {
            return new $HC_1_1$Prelude__Either__Right(new $HC_2_0$Builtins__MkPair(new $HC_2_0$Data__SortedMap__Leaf($_4_arg, $_5_arg), new $HC_2_0$Builtins__MkPair($_4_arg, new $HC_2_0$Data__SortedMap__Leaf($_6_arg.$1, $_6_arg.$2))));
        }
    }
}

// Data.SortedMap.treeLookup

function Data__SortedMap__treeLookup($_0_arg, $_1_arg, $_2_arg, $_3_arg, $_4_arg, $_5_arg){
    for(;;) {
        
        if(($_5_arg.type === 1)) {
            
            
            if($_2_arg.$3($_4_arg)($_5_arg.$2)) {
                $_0_arg = null;
                $_1_arg = null;
                $_2_arg = $_2_arg;
                $_3_arg = null;
                $_4_arg = $_4_arg;
                $_5_arg = $_5_arg.$1;
            } else {
                $_0_arg = null;
                $_1_arg = null;
                $_2_arg = $_2_arg;
                $_3_arg = null;
                $_4_arg = $_4_arg;
                $_5_arg = $_5_arg.$3;
            }
        } else if(($_5_arg.type === 2)) {
            
            
            if($_2_arg.$3($_4_arg)($_5_arg.$2)) {
                $_0_arg = null;
                $_1_arg = null;
                $_2_arg = $_2_arg;
                $_3_arg = null;
                $_4_arg = $_4_arg;
                $_5_arg = $_5_arg.$1;
            } else {
                
                
                if($_2_arg.$3($_4_arg)($_5_arg.$4)) {
                    $_0_arg = null;
                    $_1_arg = null;
                    $_2_arg = $_2_arg;
                    $_3_arg = null;
                    $_4_arg = $_4_arg;
                    $_5_arg = $_5_arg.$3;
                } else {
                    $_0_arg = null;
                    $_1_arg = null;
                    $_2_arg = $_2_arg;
                    $_3_arg = null;
                    $_4_arg = $_4_arg;
                    $_5_arg = $_5_arg.$5;
                }
            }
        } else {
            
            
            if($_2_arg.$1($_4_arg)($_5_arg.$1)) {
                return new $HC_1_1$Prelude__Maybe__Just($_5_arg.$2);
            } else {
                return $HC_0_0$Prelude__Maybe__Nothing;
            }
        }
    }
}

// Language.JSON.String.Lexer.unicodeEscape

function Language__JSON__String__Lexer__unicodeEscape(){
    return new $HC_2_4$Text__Lexer__Core__SeqEat(new $HC_1_3$Text__Lexer__Core__Pred($partial_0_1$Language__JSON__String__Lexer___123_legalChar_95_51_125_()), new $JSRTS.Lazy((function(){
        return (function(){
            return Language__JSON__String__Lexer___123_unicodeEscape_95_116_125_();
        })();
    })));
}

// Main.update_qty

function Main__update_95_qty($_0_x, $_1_x1, $_2_w){
    return (update_qty(($_0_x),($_1_x1)));
}

// Text.Parser.Core.weakenRes

function Text__Parser__Core__weakenRes($_0_arg, $_1_arg, $_2_arg, $_3_arg, $_4_arg, $_5_arg, $_6_arg){
    
    if(($_6_arg.type === 1)) {
        
        if($_2_arg) {
            return new $HC_2_1$Text__Parser__Core__EmptyRes($_5_arg, $_6_arg.$2);
        } else {
            return new $HC_2_1$Text__Parser__Core__EmptyRes($_5_arg, $_6_arg.$2);
        }
    } else if(($_6_arg.type === 0)) {
        return new $HC_1_0$Text__Parser__Core__Failure($_5_arg);
    } else {
        return new $HC_4_2$Text__Parser__Core__NonEmptyRes($_6_arg.$1, $_5_arg, $_6_arg.$3, $_6_arg.$4);
    }
}

// Text.Parser.Core.{*>_0}

function Text__Parser__Core___123__42__62__95_0_125_($_0_lift, $_1_lift){
    return $_1_lift;
}

// Text.Parser.Core.{*>_1}

function Text__Parser__Core___123__42__62__95_1_125_($_0_lift, $_1_lift, $_2_lift){
    return Prelude__Functor__Text__Parser__Core___64_Prelude__Functor__Functor_36_Grammar_32_tok_32_c_58__33_map_58_0(null, $_0_lift, null, null, $_2_lift, $_1_lift);
}

// Text.Parser.Core.{<*_2}

function Text__Parser__Core___123__60__42__95_2_125_($_0_lift, $_1_lift){
    return $_0_lift;
}

// Language.JSON.Parser.{array_9}

function Language__JSON__Parser___123_array_95_9_125_($_0_lift, $_1_lift){
    return new $HC_1_0$Text__Parser__Core__Empty(new $HC_1_4$Language__JSON__Data__JArray($_0_lift));
}

// Language.JSON.Parser.{array_10}

function Language__JSON__Parser___123_array_95_10_125_($_0_lift){
    return $partial_1_2$Language__JSON__Parser___123_array_95_9_125_($_0_lift);
}

// Language.JSON.Parser.{array_11}

function Language__JSON__Parser___123_array_95_11_125_($_0_lift){
    return new $HC_3_6$Text__Parser__Core__SeqEat(false, PE_95_match_95_44e5df34(new $HC_1_4$Language__JSON__Tokens__JTPunct(new $HC_1_2$Language__JSON__Tokens__Square($HC_0_1$Language__JSON__Tokens__Close))), new $JSRTS.Lazy((function(){
        return (function(){
            return Language__JSON__Parser___123_array_95_10_125_($_0_lift);
        })();
    })));
}

// Language.JSON.Parser.{array_12}

function Language__JSON__Parser___123_array_95_12_125_($_0_lift){
    return new $HC_4_7$Text__Parser__Core__SeqEmpty(false, true, Text__Parser__option(null, null, true, $HC_0_0$Prelude__List__Nil, Text__Parser__sepBy1(null, null, null, true, PE_95_match_95_44e5df34(new $HC_1_4$Language__JSON__Tokens__JTPunct($HC_0_0$Language__JSON__Tokens__Comma)), Language__JSON__Parser__json())), $partial_0_1$Language__JSON__Parser___123_array_95_11_125_());
}

// Language.JSON.Parser.{array_13}

function Language__JSON__Parser___123_array_95_13_125_($_0_lift){
    return new $HC_4_7$Text__Parser__Core__SeqEmpty(false, true, $HC_0_5$Text__Parser__Core__Commit, $partial_0_1$Language__JSON__Parser___123_array_95_12_125_());
}

// Language.JSON.Parser.{array_14}

function Language__JSON__Parser___123_array_95_14_125_(){
    return $partial_0_1$Language__JSON__Parser___123_array_95_13_125_();
}

// Prelude.Bits.{b16ToHexString_15}

function Prelude__Bits___123_b16ToHexString_95_15_125_($_0_lift, $_1_lift){
    return (Prelude__Bits__b8ToHexString($_0_lift) + $_1_lift);
}

// Language.JSON.Parser.{boolean_16}

function Language__JSON__Parser___123_boolean_95_16_125_($_0_lift){
    return new $HC_1_1$Language__JSON__Data__JBoolean($_0_lift);
}

// Text.Lexer.{count_17}

function Text__Lexer___123_count_95_17_125_($_0_lift, $_1_lift){
    return Text__Lexer__count(new $HC_2_0$Text__Quantity__Qty((new $JSRTS.jsbn.BigInteger(("0"))), new $HC_1_1$Prelude__Maybe__Just($_0_lift)), $_1_lift);
}

// Text.Lexer.{count_18}

function Text__Lexer___123_count_95_18_125_($_0_lift, $_1_lift, $_2_lift){
    return Text__Lexer__count(new $HC_2_0$Text__Quantity__Qty($_0_lift, new $HC_1_1$Prelude__Maybe__Just($_1_lift)), $_2_lift);
}

// Text.Lexer.{count_19}

function Text__Lexer___123_count_95_19_125_($_0_lift, $_1_lift){
    return Text__Lexer__count(new $HC_2_0$Text__Quantity__Qty($_0_lift, $HC_0_0$Prelude__Maybe__Nothing), $_1_lift);
}

// Text.Lexer.{digits_20}

function Text__Lexer___123_digits_95_20_125_(){
    return Text__Lexer__many(new $HC_1_3$Text__Lexer__Core__Pred($partial_0_1$Prelude__Chars__isDigit()));
}

// Text.Parser.Core.{doParse_21}

function Text__Parser__Core___123_doParse_95_21_125_($_0_lift, $_1_lift, $_2_lift, $_3_lift, $_4_lift, $_5_lift, $_6_lift, $_7_lift, $_8_lift, $_9_lift, $_10_lift, $_11_lift, $_12_lift){
    return $JSRTS.force($_8_lift);
}

// Text.Lexer.{exact_22}

function Text__Lexer___123_exact_95_22_125_($_0_lift, $_1_lift){
    return ($_1_lift === $_0_lift);
}

// Text.Lexer.{exact_23}

function Text__Lexer___123_exact_95_23_125_($_0_lift){
    return new $HC_1_3$Text__Lexer__Core__Pred($partial_1_2$Text__Lexer___123_exact_95_22_125_($_0_lift));
}

// Exchange.{interpret1_24}

function Exchange___123_interpret1_95_24_125_($_0_lift, $_1_lift, $_2_lift, $_3_lift){
    return $_3_lift($_2_lift);
}

// Exchange.{interpret1_26}

function Exchange___123_interpret1_95_26_125_($_0_lift){
    return new $HC_2_0$Builtins__MkPair($_0_lift, $_0_lift);
}

// Exchange.{interpret1_28}

function Exchange___123_interpret1_95_28_125_($_0_lift, $_1_lift){
    
    
    return new $HC_2_0$Exchange__Tt($_0_lift.$1.add($_1_lift.$1), $_0_lift.$2.add($_1_lift.$2));
}

// Exchange.{interpret1_29}

function Exchange___123_interpret1_95_29_125_($_0_lift, $_1_lift, $_2_lift){
    let $cg$1 = null;
    $cg$1 = $_1_lift.$1;
    let $cg$2 = null;
    $cg$2 = $_1_lift.$2;
    return new $HC_2_0$Builtins__MkPair($HC_0_0$MkUnit, PE_95_insertFrom_95_2a38cce8(null, null, Data__SortedMap__mergeWith_58_inserted_58_0(null, null, $partial_0_2$Exchange___123_interpret1_95_28_125_(), $_0_lift, Data__SortedMap__insert(null, null, $cg$1, $cg$2, Exchange__key_95_empty())), $_0_lift));
}

// Exchange.{interpret1_30}

function Exchange___123_interpret1_95_30_125_($_0_lift, $_1_lift, $_2_lift){
    return new $HC_2_0$Builtins__MkPair($_0_lift, $_2_lift);
}

// Exchange.{interpret1_31}

function Exchange___123_interpret1_95_31_125_($_0_lift, $_1_lift, $_2_lift){
    return $partial_7_8$Prelude__Monad__Control__Monad__State___64_Prelude__Monad__Monad_36_StateT_32_stateType_32_m_58__33__62__62__61__58_0(null, null, null, null, $partial_0_4$Exchange___123_interpret1_95_24_125_(), $partial_2_3$Exchange___123_interpret1_95_29_125_($_2_lift, $_0_lift), $partial_1_3$Exchange___123_interpret1_95_30_125_($_1_lift));
}

// Exchange.{interpret1_32}

function Exchange___123_interpret1_95_32_125_($_0_lift, $_1_lift){
    return $partial_7_8$Prelude__Monad__Control__Monad__State___64_Prelude__Monad__Monad_36_StateT_32_stateType_32_m_58__33__62__62__61__58_0(null, null, null, null, $partial_0_4$Exchange___123_interpret1_95_24_125_(), $partial_0_1$Exchange___123_interpret1_95_26_125_(), $partial_2_3$Exchange___123_interpret1_95_31_125_($_0_lift, $_1_lift));
}

// Exchange.{interpret1_33}

function Exchange___123_interpret1_95_33_125_($_0_lift){
    return new $HC_2_0$Builtins__MkPair($HC_0_0$Prelude__List__Nil, $_0_lift);
}

// Language.JSON.Parser.{json_35}

function Language__JSON__Parser___123_json_95_35_125_($_0_lift){
    return new $HC_1_3$Language__JSON__Data__JString($_0_lift);
}

// Language.JSON.Parser.{json_37}

function Language__JSON__Parser___123_json_95_37_125_($_0_lift){
    return new $HC_1_2$Language__JSON__Data__JNumber($_0_lift);
}

// Language.JSON.Parser.{json_38}

function Language__JSON__Parser___123_json_95_38_125_($_0_lift){
    return $HC_0_0$Language__JSON__Data__JNull;
}

// Language.JSON.String.Lexer.{jsonStringTokenMap_39}

function Language__JSON__String__Lexer___123_jsonStringTokenMap_95_39_125_($_0_lift){
    return ($_0_lift === "\"");
}

// Language.JSON.Lexer.{jsonTokenMap_40}

function Language__JSON__Lexer___123_jsonTokenMap_95_40_125_(){
    return Text__Lexer__many(new $HC_1_3$Text__Lexer__Core__Pred($partial_0_1$Prelude__Chars__isSpace()));
}

// Language.JSON.Lexer.{jsonTokenMap_41}

function Language__JSON__Lexer___123_jsonTokenMap_95_41_125_($_0_lift){
    return ($_0_lift === ",");
}

// Language.JSON.Lexer.{jsonTokenMap_42}

function Language__JSON__Lexer___123_jsonTokenMap_95_42_125_($_0_lift){
    return ($_0_lift === ":");
}

// Language.JSON.Lexer.{jsonTokenMap_43}

function Language__JSON__Lexer___123_jsonTokenMap_95_43_125_($_0_lift){
    return ($_0_lift === "[");
}

// Language.JSON.Lexer.{jsonTokenMap_44}

function Language__JSON__Lexer___123_jsonTokenMap_95_44_125_($_0_lift){
    return ($_0_lift === "]");
}

// Language.JSON.Lexer.{jsonTokenMap_45}

function Language__JSON__Lexer___123_jsonTokenMap_95_45_125_($_0_lift){
    return ($_0_lift === "{");
}

// Language.JSON.Lexer.{jsonTokenMap_46}

function Language__JSON__Lexer___123_jsonTokenMap_95_46_125_($_0_lift){
    return ($_0_lift === "}");
}

// Exchange.{key_empty_47}

function Exchange___123_key_95_empty_95_47_125_($_0_lift, $_1_lift){
    let $cg$1 = null;
    $cg$1 = ((($_0_lift.$1).toString()) + ((($_0_lift.$2).toString()) + ((($_0_lift.$3).toString()) + ((($_0_lift.$4).toString()) + ((($_0_lift.$5).toString()) + (($_0_lift.$6).toString()))))));
    let $cg$2 = null;
    $cg$2 = ((($_1_lift.$1).toString()) + ((($_1_lift.$2).toString()) + ((($_1_lift.$3).toString()) + ((($_1_lift.$4).toString()) + ((($_1_lift.$5).toString()) + (($_1_lift.$6).toString()))))));
    return ($cg$1 == $cg$2);
}

// Exchange.{key_empty_48}

function Exchange___123_key_95_empty_95_48_125_($_0_lift, $_1_lift){
    let $cg$1 = null;
    $cg$1 = ((($_0_lift.$1).toString()) + ((($_0_lift.$2).toString()) + ((($_0_lift.$3).toString()) + ((($_0_lift.$4).toString()) + ((($_0_lift.$5).toString()) + (($_0_lift.$6).toString()))))));
    let $cg$2 = null;
    $cg$2 = ((($_1_lift.$1).toString()) + ((($_1_lift.$2).toString()) + ((($_1_lift.$3).toString()) + ((($_1_lift.$4).toString()) + ((($_1_lift.$5).toString()) + (($_1_lift.$6).toString()))))));
    return Prelude__Interfaces__Prelude__Interfaces___64_Prelude__Interfaces__Ord_36_String_58__33_compare_58_0($cg$1, $cg$2);
}

// Exchange.{key_empty_49}

function Exchange___123_key_95_empty_95_49_125_($_0_lift, $_1_lift){
    let $cg$1 = null;
    $cg$1 = ((($_0_lift.$1).toString()) + ((($_0_lift.$2).toString()) + ((($_0_lift.$3).toString()) + ((($_0_lift.$4).toString()) + ((($_0_lift.$5).toString()) + (($_0_lift.$6).toString()))))));
    let $cg$2 = null;
    $cg$2 = ((($_1_lift.$1).toString()) + ((($_1_lift.$2).toString()) + ((($_1_lift.$3).toString()) + ((($_1_lift.$4).toString()) + ((($_1_lift.$5).toString()) + (($_1_lift.$6).toString()))))));
    
    if((Prelude__Interfaces__Prelude__Interfaces___64_Prelude__Interfaces__Ord_36_String_58__33_compare_58_0($cg$1, $cg$2) < 0)) {
        return true;
    } else {
        let $cg$4 = null;
        $cg$4 = ((($_0_lift.$1).toString()) + ((($_0_lift.$2).toString()) + ((($_0_lift.$3).toString()) + ((($_0_lift.$4).toString()) + ((($_0_lift.$5).toString()) + (($_0_lift.$6).toString()))))));
        let $cg$5 = null;
        $cg$5 = ((($_1_lift.$1).toString()) + ((($_1_lift.$2).toString()) + ((($_1_lift.$3).toString()) + ((($_1_lift.$4).toString()) + ((($_1_lift.$5).toString()) + (($_1_lift.$6).toString()))))));
        return ($cg$4 == $cg$5);
    }
}

// Language.JSON.String.Lexer.{legalChar_51}

function Language__JSON__String__Lexer___123_legalChar_95_51_125_($_0_lift){
    return ($_0_lift === "\\");
}

// Language.JSON.String.Lexer.{legalChar_52}

function Language__JSON__String__Lexer___123_legalChar_95_52_125_($_0_lift){
    return true;
}

// Language.JSON.Lexer.{lexJSON_53}

function Language__JSON__Lexer___123_lexJSON_95_53_125_($_0_lift){
    return $_0_lift;
}

// Text.Lexer.{like_55}

function Text__Lexer___123_like_95_55_125_($_0_lift, $_1_lift){
    let $cg$1 = null;
    if(Prelude__Chars__isLower($_0_lift)) {
        $cg$1 = String.fromCharCode(((($_0_lift).charCodeAt(0)|0) - 32));
    } else {
        $cg$1 = $_0_lift;
    }
    
    let $cg$2 = null;
    if(Prelude__Chars__isLower($_1_lift)) {
        $cg$2 = String.fromCharCode(((($_1_lift).charCodeAt(0)|0) - 32));
    } else {
        $cg$2 = $_1_lift;
    }
    
    return ($cg$1 === $cg$2);
}

// Main.{line_list2io_56}

function Main___123_line_95_list2io_95_56_125_($_0_lift, $_1_lift, $_2_lift){
    let $cg$1 = null;
    $cg$1 = $_0_lift.$1.subtract($_0_lift.$2);
    const $_67_in = ((($cg$1).intValue()|0) + $_2_lift);
    
    if((((($_67_in === 0)) ? 1|0 : 0|0) === 0)) {
        return $partial_2_3$Main__update_95_qty($_1_lift, $_67_in);
    } else {
        return $partial_1_2$Main__remove_95_row($_1_lift);
    }
}

// Main.{main_57}

function Main___123_main_95_57_125_($_0_lift){
    
    const $cg$3 = $_0_lift.$2;
    let $cg$2 = null;
    $cg$2 = (Prelude__Show__primNumShow(null, $partial_0_1$prim_95__95_toStrBigInt(), $HC_0_0$Prelude__Show__Open, $cg$3.$1) + ("//" + Prelude__Show__primNumShow(null, $partial_0_1$prim_95__95_toStrBigInt(), $HC_0_0$Prelude__Show__Open, $cg$3.$2)));
    return ("(" + (Prelude__Show__Exchange___64_Prelude__Show__Show_36_OrderLineKey_58__33_show_58_0($_0_lift.$1) + (", " + ($cg$2 + ")"))));
}

// Text.Lexer.{many_58}

function Text__Lexer___123_many_95_58_125_($_0_lift){
    return Text__Lexer__many($_0_lift);
}

// Language.JSON.Lexer.{numberLit_62}

function Language__JSON__Lexer___123_numberLit_95_62_125_($_0_lift){
    return ($_0_lift === "-");
}

// Language.JSON.Lexer.{numberLit_63}

function Language__JSON__Lexer___123_numberLit_95_63_125_($_0_lift){
    return ($_0_lift === "0");
}

// Language.JSON.Lexer.{numberLit_65}

function Language__JSON__Lexer___123_numberLit_95_65_125_($_0_lift){
    return ($_0_lift === ".");
}

// Language.JSON.Lexer.{numberLit_67}

function Language__JSON__Lexer___123_numberLit_95_67_125_(){
    return new $HC_2_4$Text__Lexer__Core__SeqEat(new $HC_1_3$Text__Lexer__Core__Pred($partial_0_1$Prelude__Chars__isDigit()), new $JSRTS.Lazy((function(){
        return (function(){
            return Text__Lexer___123_digits_95_20_125_();
        })();
    })));
}

// Language.JSON.Lexer.{numberLit_68}

function Language__JSON__Lexer___123_numberLit_95_68_125_(){
    return new $HC_2_6$Text__Lexer__Core__Alt(new $HC_2_4$Text__Lexer__Core__SeqEat(new $HC_1_3$Text__Lexer__Core__Pred($partial_0_1$Language__JSON__Lexer___123_numberLit_95_65_125_()), new $JSRTS.Lazy((function(){
        return (function(){
            return Language__JSON__Lexer___123_numberLit_95_67_125_();
        })();
    }))), $HC_0_0$Text__Lexer__Core__Empty);
}

// Language.JSON.Lexer.{numberLit_69}

function Language__JSON__Lexer___123_numberLit_95_69_125_($_0_lift){
    let $cg$1 = null;
    if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0(true, true).type === 1)) {
        $cg$1 = $HC_0_0$Prelude__List__Nil;
    } else {
        let $cg$2 = null;
        if((((("+-".slice(1) == "")) ? 1|0 : 0|0) === 0)) {
            $cg$2 = true;
        } else {
            $cg$2 = false;
        }
        
        let $cg$3 = null;
        if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$2, true).type === 1)) {
            $cg$3 = $HC_0_0$Prelude__List__Nil;
        } else {
            let $cg$4 = null;
            if((((("+-".slice(1).slice(1) == "")) ? 1|0 : 0|0) === 0)) {
                $cg$4 = true;
            } else {
                $cg$4 = false;
            }
            
            let $cg$5 = null;
            if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$4, true).type === 1)) {
                $cg$5 = $HC_0_0$Prelude__List__Nil;
            } else {
                let $cg$6 = null;
                if((((("+-".slice(1).slice(1).slice(1) == "")) ? 1|0 : 0|0) === 0)) {
                    $cg$6 = true;
                } else {
                    $cg$6 = false;
                }
                
                let $cg$7 = null;
                if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$6, true).type === 1)) {
                    $cg$7 = $HC_0_0$Prelude__List__Nil;
                } else {
                    let $cg$8 = null;
                    if((((("+-".slice(1).slice(1).slice(1).slice(1) == "")) ? 1|0 : 0|0) === 0)) {
                        $cg$8 = true;
                    } else {
                        $cg$8 = false;
                    }
                    
                    let $cg$9 = null;
                    if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$8, true).type === 1)) {
                        $cg$9 = $HC_0_0$Prelude__Strings__StrNil;
                    } else {
                        $cg$9 = new $HC_2_1$Prelude__Strings__StrCons("+-".slice(1).slice(1).slice(1).slice(1)[0], "+-".slice(1).slice(1).slice(1).slice(1).slice(1));
                    }
                    
                    $cg$7 = new $HC_2_1$Prelude__List___58__58_("+-".slice(1).slice(1).slice(1)[0], _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$9));
                }
                
                $cg$5 = new $HC_2_1$Prelude__List___58__58_("+-".slice(1).slice(1)[0], $cg$7);
            }
            
            $cg$3 = new $HC_2_1$Prelude__List___58__58_("+-".slice(1)[0], $cg$5);
        }
        
        $cg$1 = new $HC_2_1$Prelude__List___58__58_("+-"[0], $cg$3);
    }
    
    return PE_95_elemBy_95_3a7ca737($_0_lift, $cg$1);
}

// Language.JSON.Lexer.{numberLit_70}

function Language__JSON__Lexer___123_numberLit_95_70_125_(){
    return new $HC_2_6$Text__Lexer__Core__Alt(new $HC_1_3$Text__Lexer__Core__Pred($partial_0_1$Language__JSON__Lexer___123_numberLit_95_69_125_()), $HC_0_0$Text__Lexer__Core__Empty);
}

// Language.JSON.Lexer.{numberLit_73}

function Language__JSON__Lexer___123_numberLit_95_73_125_(){
    return new $HC_2_6$Text__Lexer__Core__Alt(new $HC_2_4$Text__Lexer__Core__SeqEat(new $HC_2_4$Text__Lexer__Core__SeqEat(Text__Lexer__like("e"), new $JSRTS.Lazy((function(){
        return (function(){
            return Language__JSON__Lexer___123_numberLit_95_70_125_();
        })();
    }))), new $JSRTS.Lazy((function(){
        return (function(){
            return Language__JSON__Lexer___123_numberLit_95_67_125_();
        })();
    }))), $HC_0_0$Text__Lexer__Core__Empty);
}

// Language.JSON.Parser.{object_74}

function Language__JSON__Parser___123_object_95_74_125_($_0_lift, $_1_lift){
    return new $HC_1_0$Text__Parser__Core__Empty(new $HC_1_5$Language__JSON__Data__JObject($_0_lift));
}

// Language.JSON.Parser.{object_75}

function Language__JSON__Parser___123_object_95_75_125_($_0_lift){
    return $partial_1_2$Language__JSON__Parser___123_object_95_74_125_($_0_lift);
}

// Language.JSON.Parser.{object_76}

function Language__JSON__Parser___123_object_95_76_125_($_0_lift){
    return new $HC_3_6$Text__Parser__Core__SeqEat(false, PE_95_match_95_44e5df34(new $HC_1_4$Language__JSON__Tokens__JTPunct(new $HC_1_3$Language__JSON__Tokens__Curly($HC_0_1$Language__JSON__Tokens__Close))), new $JSRTS.Lazy((function(){
        return (function(){
            return Language__JSON__Parser___123_object_95_75_125_($_0_lift);
        })();
    })));
}

// Language.JSON.Parser.{object_77}

function Language__JSON__Parser___123_object_95_77_125_($_0_lift){
    return new $HC_4_7$Text__Parser__Core__SeqEmpty(false, true, Language__JSON__Parser__object_58_properties_58_0(), $partial_0_1$Language__JSON__Parser___123_object_95_76_125_());
}

// Language.JSON.Parser.{object_78}

function Language__JSON__Parser___123_object_95_78_125_($_0_lift){
    return new $HC_4_7$Text__Parser__Core__SeqEmpty(false, true, $HC_0_5$Text__Parser__Core__Commit, $partial_0_1$Language__JSON__Parser___123_object_95_77_125_());
}

// Language.JSON.Parser.{object_79}

function Language__JSON__Parser___123_object_95_79_125_(){
    return $partial_0_1$Language__JSON__Parser___123_object_95_78_125_();
}

// Language.JSON.Parser.{parseJSON_80}

function Language__JSON__Parser___123_parseJSON_95_80_125_($_0_lift){
    
    return (!($_0_lift.$1.type === 5));
}

// Language.JSON.String.{permissiveStringLit_85}

function Language__JSON__String___123_permissiveStringLit_95_85_125_(){
    return new $HC_1_3$Text__Lexer__Core__Pred($partial_0_1$Language__JSON__String__Lexer___123_legalChar_95_52_125_());
}

// Language.JSON.String.{permissiveStringLit_87}

function Language__JSON__String___123_permissiveStringLit_95_87_125_(){
    return Text__Lexer__many(new $HC_2_5$Text__Lexer__Core__SeqEmpty(new $HC_2_2$Text__Lexer__Core__Lookahead(false, new $HC_1_3$Text__Lexer__Core__Pred($partial_0_1$Language__JSON__String__Lexer___123_jsonStringTokenMap_95_39_125_())), new $HC_2_6$Text__Lexer__Core__Alt(new $HC_2_4$Text__Lexer__Core__SeqEat(new $HC_1_3$Text__Lexer__Core__Pred($partial_0_1$Language__JSON__String__Lexer___123_legalChar_95_51_125_()), new $JSRTS.Lazy((function(){
        return (function(){
            return Language__JSON__String___123_permissiveStringLit_95_85_125_();
        })();
    }))), new $HC_1_3$Text__Lexer__Core__Pred($partial_0_1$Language__JSON__String__Lexer___123_legalChar_95_52_125_()))));
}

// Language.JSON.String.{permissiveStringLit_89}

function Language__JSON__String___123_permissiveStringLit_95_89_125_(){
    return new $HC_2_6$Text__Lexer__Core__Alt(new $HC_1_3$Text__Lexer__Core__Pred($partial_0_1$Language__JSON__String__Lexer___123_jsonStringTokenMap_95_39_125_()), $HC_0_0$Text__Lexer__Core__Empty);
}

// Language.JSON.String.Parser.{quotedString_90}

function Language__JSON__String__Parser___123_quotedString_95_90_125_($_0_lift, $_1_lift){
    return new $HC_1_0$Text__Parser__Core__Empty(Prelude__Foldable__Prelude__List___64_Prelude__Foldable__Foldable_36_List_58__33_foldr_58_0(null, null, $partial_0_2$prim_95__95_strCons(), "", $_0_lift));
}

// Language.JSON.String.Parser.{quotedString_91}

function Language__JSON__String__Parser___123_quotedString_95_91_125_($_0_lift){
    return new $HC_4_7$Text__Parser__Core__SeqEmpty(false, false, $HC_0_3$Text__Parser__Core__EOF, $partial_1_2$Language__JSON__String__Parser___123_quotedString_95_90_125_($_0_lift));
}

// Language.JSON.String.Parser.{quotedString_92}

function Language__JSON__String__Parser___123_quotedString_95_92_125_(){
    return $partial_0_1$Language__JSON__String__Parser___123_quotedString_95_91_125_();
}

// Text.Lexer.{range_93}

function Text__Lexer___123_range_95_93_125_($_0_lift, $_1_lift, $_2_lift){
    let $cg$1 = null;
    if((Prelude__Interfaces__Prelude__Interfaces___64_Prelude__Interfaces__Ord_36_Char_58__33_compare_58_0($_0_lift, $_1_lift) < 0)) {
        $cg$1 = $_0_lift;
    } else {
        $cg$1 = $_1_lift;
    }
    
    let $cg$2 = null;
    if((Prelude__Interfaces__Prelude__Interfaces___64_Prelude__Interfaces__Ord_36_Char_58__33_compare_58_0($_2_lift, $cg$1) > 0)) {
        $cg$2 = true;
    } else {
        let $cg$3 = null;
        if((Prelude__Interfaces__Prelude__Interfaces___64_Prelude__Interfaces__Ord_36_Char_58__33_compare_58_0($_0_lift, $_1_lift) < 0)) {
            $cg$3 = $_0_lift;
        } else {
            $cg$3 = $_1_lift;
        }
        
        $cg$2 = ($_2_lift === $cg$3);
    }
    
    
    if($cg$2) {
        let $cg$5 = null;
        if((Prelude__Interfaces__Prelude__Interfaces___64_Prelude__Interfaces__Ord_36_Char_58__33_compare_58_0($_0_lift, $_1_lift) > 0)) {
            $cg$5 = $_0_lift;
        } else {
            $cg$5 = $_1_lift;
        }
        
        
        if((Prelude__Interfaces__Prelude__Interfaces___64_Prelude__Interfaces__Ord_36_Char_58__33_compare_58_0($_2_lift, $cg$5) < 0)) {
            return true;
        } else {
            let $cg$7 = null;
            if((Prelude__Interfaces__Prelude__Interfaces___64_Prelude__Interfaces__Ord_36_Char_58__33_compare_58_0($_0_lift, $_1_lift) > 0)) {
                $cg$7 = $_0_lift;
            } else {
                $cg$7 = $_1_lift;
            }
            
            return ($_2_lift === $cg$7);
        }
    } else {
        return false;
    }
}

// Language.JSON.Parser.{rawString_94}

function Language__JSON__Parser___123_rawString_95_94_125_($_0_lift){
    
    if(($_0_lift.type === 1)) {
        return new $HC_1_0$Text__Parser__Core__Empty($_0_lift.$1);
    } else {
        return $HC_0_4$Text__Parser__Core__Fail;
    }
}

// Language.JSON.Parser.{rawString_95}

function Language__JSON__Parser___123_rawString_95_95_125_(){
    return $partial_0_1$Language__JSON__Parser___123_rawString_95_94_125_();
}

// Text.Parser.{sepBy1_96}

function Text__Parser___123_sepBy1_95_96_125_($_0_lift, $_1_lift){
    return new $HC_2_1$Prelude__List___58__58_($_0_lift, $_1_lift);
}

// Text.Parser.{sepBy1_98}

function Text__Parser___123_sepBy1_95_98_125_($_0_lift, $_1_lift, $_2_lift, $_3_lift){
    return Prelude__Functor__Text__Parser__Core___64_Prelude__Functor__Functor_36_Grammar_32_tok_32_c_58__33_map_58_0(null, false, null, null, $_3_lift, Text__Parser__option(null, null, true, $HC_0_0$Prelude__List__Nil, Text__Parser__some(null, null, Text__Parser__Core___42__62_(null, $_0_lift, true, null, null, $_1_lift, $_2_lift))));
}

// Language.JSON.Data.{showString_99}

function Language__JSON__Data___123_showString_95_99_125_($_0_lift, $_1_lift){
    return (Language__JSON__Data__showChar($_0_lift) + $_1_lift);
}

// Language.JSON.String.Lexer.{simpleEscape_101}

function Language__JSON__String__Lexer___123_simpleEscape_95_101_125_($_0_lift){
    let $cg$1 = null;
    if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0(true, true).type === 1)) {
        $cg$1 = $HC_0_0$Prelude__List__Nil;
    } else {
        let $cg$2 = null;
        if((((("\"\\/bfnrt".slice(1) == "")) ? 1|0 : 0|0) === 0)) {
            $cg$2 = true;
        } else {
            $cg$2 = false;
        }
        
        let $cg$3 = null;
        if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$2, true).type === 1)) {
            $cg$3 = $HC_0_0$Prelude__Strings__StrNil;
        } else {
            $cg$3 = new $HC_2_1$Prelude__Strings__StrCons("\"\\/bfnrt".slice(1)[0], "\"\\/bfnrt".slice(1).slice(1));
        }
        
        $cg$1 = new $HC_2_1$Prelude__List___58__58_("\"\\/bfnrt"[0], _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$3));
    }
    
    return PE_95_elemBy_95_3a7ca737($_0_lift, $cg$1);
}

// Language.JSON.String.Lexer.{simpleEscape_102}

function Language__JSON__String__Lexer___123_simpleEscape_95_102_125_(){
    return new $HC_1_3$Text__Lexer__Core__Pred($partial_0_1$Language__JSON__String__Lexer___123_simpleEscape_95_101_125_());
}

// Text.Parser.{some_103}

function Text__Parser___123_some_95_103_125_($_0_lift, $_1_lift){
    return new $HC_1_0$Text__Parser__Core__Empty(new $HC_2_1$Prelude__List___58__58_($_0_lift, $_1_lift));
}

// Text.Parser.{some_104}

function Text__Parser___123_some_95_104_125_($_0_lift, $_1_lift){
    return new $HC_4_7$Text__Parser__Core__SeqEmpty(false, false, Text__Parser__option(null, null, true, $HC_0_0$Prelude__List__Nil, Text__Parser__some(null, null, $_0_lift)), $partial_1_2$Text__Parser___123_some_95_103_125_($_1_lift));
}

// Text.Parser.{some_105}

function Text__Parser___123_some_95_105_125_($_0_lift){
    return $partial_1_2$Text__Parser___123_some_95_104_125_($_0_lift);
}

// Printf.{toFunction_107}

function Printf___123_toFunction_95_107_125_($_0_lift, $_1_lift, $_2_lift){
    return Printf__toFunction($_0_lift, ($_1_lift + Prelude__Show__primNumShow(null, $partial_0_1$prim_95__95_toStrBigInt(), $HC_0_0$Prelude__Show__Open, $_2_lift)));
}

// Printf.{toFunction_108}

function Printf___123_toFunction_95_108_125_($_0_lift, $_1_lift, $_2_lift){
    return Printf__toFunction($_0_lift, ($_1_lift + $_2_lift));
}

// Data.SortedMap.{toList_109}

function Data__SortedMap___123_toList_95_109_125_($_0_lift){
    return new $HC_2_1$Prelude__List___58__58_($_0_lift, $HC_0_0$Prelude__List__Nil);
}

// Text.Lexer.{toTokenMap_110}

function Text__Lexer___123_toTokenMap_95_110_125_($_0_lift, $_1_lift){
    return new $HC_2_0$Text__Token__Tok($_0_lift, $_1_lift);
}

// Text.Lexer.{toTokenMap_111}

function Text__Lexer___123_toTokenMap_95_111_125_($_0_lift){
    
    return new $HC_2_0$Builtins__MkPair($_0_lift.$1, $partial_1_2$Text__Lexer___123_toTokenMap_95_110_125_($_0_lift.$2));
}

// Language.JSON.String.Lexer.{unicodeEscape_113}

function Language__JSON__String__Lexer___123_unicodeEscape_95_113_125_($_0_lift){
    return ($_0_lift === "u");
}

// Language.JSON.String.Lexer.{unicodeEscape_114}

function Language__JSON__String__Lexer___123_unicodeEscape_95_114_125_($_0_lift){
    let $cg$1 = null;
    if(Prelude__Chars__isLower($_0_lift)) {
        $cg$1 = String.fromCharCode(((($_0_lift).charCodeAt(0)|0) - 32));
    } else {
        $cg$1 = $_0_lift;
    }
    
    return PE_95_elemBy_95_3a7ca737($cg$1, Prelude__Chars__isHexDigit_58_hexChars_58_0(null));
}

// Language.JSON.String.Lexer.{unicodeEscape_115}

function Language__JSON__String__Lexer___123_unicodeEscape_95_115_125_(){
    return Text__Lexer__count(new $HC_2_0$Text__Quantity__Qty((new $JSRTS.jsbn.BigInteger(("4"))), new $HC_1_1$Prelude__Maybe__Just((new $JSRTS.jsbn.BigInteger(("4"))))), new $HC_1_3$Text__Lexer__Core__Pred($partial_0_1$Language__JSON__String__Lexer___123_unicodeEscape_95_114_125_()));
}

// Language.JSON.String.Lexer.{unicodeEscape_116}

function Language__JSON__String__Lexer___123_unicodeEscape_95_116_125_(){
    return new $HC_2_4$Text__Lexer__Core__SeqEat(new $HC_1_3$Text__Lexer__Core__Pred($partial_0_1$Language__JSON__String__Lexer___123_unicodeEscape_95_113_125_()), new $JSRTS.Lazy((function(){
        return (function(){
            return Language__JSON__String__Lexer___123_unicodeEscape_95_115_125_();
        })();
    })));
}

// Prelude.Functor.{Text.Parser.Core.@Prelude.Functor.Functor$Grammar tok c:!map:0_lam_129}

function Prelude__Functor___123_Text__Parser__Core___64_Prelude__Functor__Functor_36_Grammar_32_tok_32_c_58__33_map_58_0_95_lam_95_129_125_($_0_lift, $_1_lift){
    return new $HC_1_0$Text__Parser__Core__Empty($_0_lift($_1_lift));
}

// Prelude.Functor.{Text.Parser.Core.@Prelude.Functor.Functor$Grammar tok c:!map:0_lam_130}

function Prelude__Functor___123_Text__Parser__Core___64_Prelude__Functor__Functor_36_Grammar_32_tok_32_c_58__33_map_58_0_95_lam_95_130_125_($_0_lift, $_1_lift, $_2_lift, $_3_lift, $_4_lift, $_5_lift, $_6_lift, $_7_lift, $_8_lift, $_9_lift){
    return $JSRTS.force($_8_lift);
}

// Prelude.Functor.{Text.Parser.Core.@Prelude.Functor.Functor$Grammar tok c:!map:0_lam_131}

function Prelude__Functor___123_Text__Parser__Core___64_Prelude__Functor__Functor_36_Grammar_32_tok_32_c_58__33_map_58_0_95_lam_95_131_125_($_0_lift, $_1_lift, $_2_lift, $_3_lift, $_4_lift, $_5_lift, $_6_lift, $_7_lift, $_8_lift, $_9_lift){
    return Prelude__Functor__Text__Parser__Core___64_Prelude__Functor__Functor_36_Grammar_32_tok_32_c_58__33_map_58_0(null, $_0_lift, null, null, $_1_lift, Prelude__Functor___123_Text__Parser__Core___64_Prelude__Functor__Functor_36_Grammar_32_tok_32_c_58__33_map_58_0_95_lam_95_130_125_($_2_lift, $_3_lift, $_4_lift, $_5_lift, $_1_lift, $_6_lift, $_0_lift, $_7_lift, $_8_lift, $_9_lift)($_9_lift));
}

// Prelude.Functor.{Text.Parser.Core.@Prelude.Functor.Functor$Grammar tok c:!map:0_lam_132}

function Prelude__Functor___123_Text__Parser__Core___64_Prelude__Functor__Functor_36_Grammar_32_tok_32_c_58__33_map_58_0_95_lam_95_132_125_($_0_lift, $_1_lift, $_2_lift, $_3_lift, $_4_lift, $_5_lift, $_6_lift, $_7_lift, $_8_lift){
    return $partial_9_10$Prelude__Functor___123_Text__Parser__Core___64_Prelude__Functor__Functor_36_Grammar_32_tok_32_c_58__33_map_58_0_95_lam_95_131_125_($_0_lift, $_1_lift, $_2_lift, $_3_lift, $_4_lift, $_5_lift, $_6_lift, $_7_lift, $_8_lift);
}

// Prelude.Functor.{Text.Parser.Core.@Prelude.Functor.Functor$Grammar tok c:!map:0_lam_134}

function Prelude__Functor___123_Text__Parser__Core___64_Prelude__Functor__Functor_36_Grammar_32_tok_32_c_58__33_map_58_0_95_lam_95_134_125_($_0_lift, $_1_lift, $_2_lift, $_3_lift){
    return Prelude__Functor__Text__Parser__Core___64_Prelude__Functor__Functor_36_Grammar_32_tok_32_c_58__33_map_58_0(null, $_0_lift, null, null, $_1_lift, $_2_lift($_3_lift));
}

// Prelude.Functor.{Text.Parser.Core.@Prelude.Functor.Functor$Grammar tok c:!map:0_lam_135}

function Prelude__Functor___123_Text__Parser__Core___64_Prelude__Functor__Functor_36_Grammar_32_tok_32_c_58__33_map_58_0_95_lam_95_135_125_($_0_lift, $_1_lift, $_2_lift){
    return Prelude__Functor__Prelude___64_Prelude__Functor__Functor_36_Maybe_58__33_map_58_0(null, null, $_0_lift, $_1_lift($_2_lift));
}

// Prelude.Monad.{Control.Monad.State.@Prelude.Monad.Monad$StateT stateType m:!>>=:0_lam_138}

function Prelude__Monad___123_Control__Monad__State___64_Prelude__Monad__Monad_36_StateT_32_stateType_32_m_58__33__62__62__61__58_0_95_lam_95_138_125_($_0_lift, $_1_lift){
    
    return $_0_lift($_1_lift.$1)($_1_lift.$2);
}

// Decidable.Equality.Decidable.Equality.Bool implementation of Decidable.Equality.DecEq, method decEq

function Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($_0_arg, $_1_arg){
    
    if($_1_arg) {
        
        if($_0_arg) {
            return $HC_0_0$Prelude__Basics__Yes;
        } else {
            return $HC_0_1$Prelude__Basics__No;
        }
    } else {
        
        if($_0_arg) {
            return $HC_0_1$Prelude__Basics__No;
        } else {
            return $HC_0_0$Prelude__Basics__Yes;
        }
    }
}

// Prelude.Interfaces.Prelude.Interfaces.Bool implementation of Prelude.Interfaces.Eq, method ==

function Prelude__Interfaces__Prelude__Interfaces___64_Prelude__Interfaces__Eq_36_Bool_58__33__61__61__58_0($_0_arg, $_1_arg){
    
    if($_1_arg) {
        
        if($_0_arg) {
            return $_0_arg;
        } else {
            return $_0_arg;
        }
    } else {
        return (!(!(!$_0_arg)));
    }
}

// Prelude.Interfaces.Language.JSON.Tokens.Bracket implementation of Prelude.Interfaces.Eq, method ==

function Prelude__Interfaces__Language__JSON__Tokens___64_Prelude__Interfaces__Eq_36_Bracket_58__33__61__61__58_0($_0_arg, $_1_arg){
    
    if(($_1_arg.type === 1)) {
        return (!(!($_0_arg.type === 1)));
    } else if(($_1_arg.type === 0)) {
        return (!(!($_0_arg.type === 0)));
    } else {
        return false;
    }
}

// Prelude.Interfaces.Language.JSON.String.Tokens.JSONStringTokenKind implementation of Prelude.Interfaces.Eq, method ==

function Prelude__Interfaces__Language__JSON__String__Tokens___64_Prelude__Interfaces__Eq_36_JSONStringTokenKind_58__33__61__61__58_0($_0_arg, $_1_arg){
    
    if(($_1_arg.type === 1)) {
        return (!(!($_0_arg.type === 1)));
    } else if(($_1_arg.type === 0)) {
        return (!(!($_0_arg.type === 0)));
    } else if(($_1_arg.type === 2)) {
        return (!(!($_0_arg.type === 2)));
    } else if(($_1_arg.type === 3)) {
        return (!(!($_0_arg.type === 3)));
    } else {
        return false;
    }
}

// Prelude.Interfaces.Language.JSON.Tokens.JSONTokenKind implementation of Prelude.Interfaces.Eq, method ==

function Prelude__Interfaces__Language__JSON__Tokens___64_Prelude__Interfaces__Eq_36_JSONTokenKind_58__33__61__61__58_0($_0_arg, $_1_arg){
    
    if(($_1_arg.type === 0)) {
        return (!(!($_0_arg.type === 0)));
    } else if(($_1_arg.type === 3)) {
        return (!(!($_0_arg.type === 3)));
    } else if(($_1_arg.type === 1)) {
        return (!(!($_0_arg.type === 1)));
    } else if(($_1_arg.type === 4)) {
        
        if(($_0_arg.type === 4)) {
            return Prelude__Interfaces__Language__JSON__Tokens___64_Prelude__Interfaces__Eq_36_Punctuation_58__33__61__61__58_0($_0_arg.$1, $_1_arg.$1);
        } else {
            return false;
        }
    } else if(($_1_arg.type === 2)) {
        return (!(!($_0_arg.type === 2)));
    } else {
        return false;
    }
}

// Prelude.Interfaces.Language.JSON.Tokens.Punctuation implementation of Prelude.Interfaces.Eq, method ==

function Prelude__Interfaces__Language__JSON__Tokens___64_Prelude__Interfaces__Eq_36_Punctuation_58__33__61__61__58_0($_0_arg, $_1_arg){
    
    if(($_1_arg.type === 1)) {
        return (!(!($_0_arg.type === 1)));
    } else if(($_1_arg.type === 0)) {
        return (!(!($_0_arg.type === 0)));
    } else if(($_1_arg.type === 3)) {
        
        if(($_0_arg.type === 3)) {
            return Prelude__Interfaces__Language__JSON__Tokens___64_Prelude__Interfaces__Eq_36_Bracket_58__33__61__61__58_0($_0_arg.$1, $_1_arg.$1);
        } else {
            return false;
        }
    } else if(($_1_arg.type === 2)) {
        
        if(($_0_arg.type === 2)) {
            return Prelude__Interfaces__Language__JSON__Tokens___64_Prelude__Interfaces__Eq_36_Bracket_58__33__61__61__58_0($_0_arg.$1, $_1_arg.$1);
        } else {
            return false;
        }
    } else {
        return false;
    }
}

// Prelude.Foldable.Prelude.List.List implementation of Prelude.Foldable.Foldable, method foldl

function Prelude__Foldable__Prelude__List___64_Prelude__Foldable__Foldable_36_List_58__33_foldl_58_0($_0_arg, $_1_arg, $_2_arg, $_3_arg, $_4_arg){
    let $tco$$_3_arg = $_3_arg;
    for(;;) {
        
        if(($_4_arg.type === 1)) {
            $tco$$_3_arg = $_2_arg($_3_arg)($_4_arg.$1);
            $_0_arg = null;
            $_1_arg = null;
            $_2_arg = $_2_arg;
            $_3_arg = $tco$$_3_arg;
            $_4_arg = $_4_arg.$2;
        } else {
            return $_3_arg;
        }
    }
}

// Prelude.Foldable.Prelude.List.List implementation of Prelude.Foldable.Foldable, method foldr

function Prelude__Foldable__Prelude__List___64_Prelude__Foldable__Foldable_36_List_58__33_foldr_58_0($_0_arg, $_1_arg, $_2_arg, $_3_arg, $_4_arg){
    
    if(($_4_arg.type === 1)) {
        return $_2_arg($_4_arg.$1)(Prelude__Foldable__Prelude__List___64_Prelude__Foldable__Foldable_36_List_58__33_foldr_58_0(null, null, $_2_arg, $_3_arg, $_4_arg.$2));
    } else {
        return $_3_arg;
    }
}

// Prelude.Functor.Text.Parser.Core.Grammar tok c implementation of Prelude.Functor.Functor, method map

function Prelude__Functor__Text__Parser__Core___64_Prelude__Functor__Functor_36_Grammar_32_tok_32_c_58__33_map_58_0($_0_arg, $_1_arg, $_2_arg, $_3_arg, $_4_arg, $_5_arg){
    
    if(($_5_arg.type === 8)) {
        return new $HC_4_8$Text__Parser__Core__Alt($_5_arg.$1, $_5_arg.$2, Prelude__Functor__Text__Parser__Core___64_Prelude__Functor__Functor_36_Grammar_32_tok_32_c_58__33_map_58_0(null, $_5_arg.$1, null, null, $_4_arg, $_5_arg.$3), Prelude__Functor__Text__Parser__Core___64_Prelude__Functor__Functor_36_Grammar_32_tok_32_c_58__33_map_58_0(null, $_5_arg.$2, null, null, $_4_arg, $_5_arg.$4));
    } else if(($_5_arg.type === 0)) {
        
        if((!$_1_arg)) {
            return new $HC_1_0$Text__Parser__Core__Empty($_4_arg($_5_arg.$1));
        } else {
            return new $HC_4_7$Text__Parser__Core__SeqEmpty(false, false, $_5_arg, $partial_1_2$Prelude__Functor___123_Text__Parser__Core___64_Prelude__Functor__Functor_36_Grammar_32_tok_32_c_58__33_map_58_0_95_lam_95_129_125_($_4_arg));
        }
    } else if(($_5_arg.type === 4)) {
        return $_5_arg;
    } else if(($_5_arg.type === 6)) {
        
        if($_1_arg) {
            return new $HC_3_6$Text__Parser__Core__SeqEat($_5_arg.$1, $_5_arg.$2, new $JSRTS.Lazy((function(){
                return (function(){
                    return Prelude__Functor___123_Text__Parser__Core___64_Prelude__Functor__Functor_36_Grammar_32_tok_32_c_58__33_map_58_0_95_lam_95_132_125_($_5_arg.$1, $_4_arg, $_0_arg, $_1_arg, $_2_arg, $_3_arg, $_5_arg, $_5_arg.$2, $_5_arg.$3);
                })();
            })));
        } else {
            return new $HC_4_7$Text__Parser__Core__SeqEmpty(false, false, $_5_arg, $partial_1_2$Prelude__Functor___123_Text__Parser__Core___64_Prelude__Functor__Functor_36_Grammar_32_tok_32_c_58__33_map_58_0_95_lam_95_129_125_($_4_arg));
        }
    } else if(($_5_arg.type === 7)) {
        return new $HC_4_7$Text__Parser__Core__SeqEmpty($_5_arg.$1, $_5_arg.$2, $_5_arg.$3, $partial_3_4$Prelude__Functor___123_Text__Parser__Core___64_Prelude__Functor__Functor_36_Grammar_32_tok_32_c_58__33_map_58_0_95_lam_95_134_125_($_5_arg.$2, $_4_arg, $_5_arg.$4));
    } else if(($_5_arg.type === 1)) {
        
        if($_1_arg) {
            return new $HC_1_1$Text__Parser__Core__Terminal($partial_2_3$Prelude__Functor___123_Text__Parser__Core___64_Prelude__Functor__Functor_36_Grammar_32_tok_32_c_58__33_map_58_0_95_lam_95_135_125_($_4_arg, $_5_arg.$1));
        } else {
            return new $HC_4_7$Text__Parser__Core__SeqEmpty(false, false, $_5_arg, $partial_1_2$Prelude__Functor___123_Text__Parser__Core___64_Prelude__Functor__Functor_36_Grammar_32_tok_32_c_58__33_map_58_0_95_lam_95_129_125_($_4_arg));
        }
    } else {
        return new $HC_4_7$Text__Parser__Core__SeqEmpty(false, false, $_5_arg, $partial_1_2$Prelude__Functor___123_Text__Parser__Core___64_Prelude__Functor__Functor_36_Grammar_32_tok_32_c_58__33_map_58_0_95_lam_95_129_125_($_4_arg));
    }
}

// Prelude.Functor.Prelude.List.List implementation of Prelude.Functor.Functor, method map

function Prelude__Functor__Prelude__List___64_Prelude__Functor__Functor_36_List_58__33_map_58_0($_0_arg, $_1_arg, $_2_arg, $_3_arg){
    
    if(($_3_arg.type === 1)) {
        return new $HC_2_1$Prelude__List___58__58_($_2_arg($_3_arg.$1), Prelude__Functor__Prelude__List___64_Prelude__Functor__Functor_36_List_58__33_map_58_0(null, null, $_2_arg, $_3_arg.$2));
    } else {
        return $_3_arg;
    }
}

// Prelude.Functor.Prelude.Maybe implementation of Prelude.Functor.Functor, method map

function Prelude__Functor__Prelude___64_Prelude__Functor__Functor_36_Maybe_58__33_map_58_0($_0_arg, $_1_arg, $_2_arg, $_3_arg){
    
    if(($_3_arg.type === 1)) {
        return new $HC_1_1$Prelude__Maybe__Just($_2_arg($_3_arg.$1));
    } else {
        return $_3_arg;
    }
}

// Prelude.Monad.Control.Monad.State.StateT stateType m implementation of Prelude.Monad.Monad, method >>=

function Prelude__Monad__Control__Monad__State___64_Prelude__Monad__Monad_36_StateT_32_stateType_32_m_58__33__62__62__61__58_0($_0_arg, $_1_arg, $_2_arg, $_3_arg, $_4_arg, $_5_arg, $_6_arg, $_7_st){
    return $_4_arg(null)(null)($_5_arg($_7_st))($partial_1_2$Prelude__Monad___123_Control__Monad__State___64_Prelude__Monad__Monad_36_StateT_32_stateType_32_m_58__33__62__62__61__58_0_95_lam_95_138_125_($_6_arg));
}

// Prelude.Interfaces.Prelude.Interfaces.Char implementation of Prelude.Interfaces.Ord, method compare

function Prelude__Interfaces__Prelude__Interfaces___64_Prelude__Interfaces__Ord_36_Char_58__33_compare_58_0($_0_arg, $_1_arg){
    
    if((((($_0_arg === $_1_arg)) ? 1|0 : 0|0) === 0)) {
        
        if((((($_0_arg < $_1_arg)) ? 1|0 : 0|0) === 0)) {
            return 1;
        } else {
            return -1;
        }
    } else {
        return 0;
    }
}

// Prelude.Interfaces.Prelude.Interfaces.Integer implementation of Prelude.Interfaces.Ord, method compare

function Prelude__Interfaces__Prelude__Interfaces___64_Prelude__Interfaces__Ord_36_Integer_58__33_compare_58_0($_0_arg, $_1_arg){
    
    if(((($_0_arg.equals($_1_arg)) ? 1|0 : 0|0) === 0)) {
        
        if(((((($_0_arg).compareTo(($_1_arg)) < 0)) ? 1|0 : 0|0) === 0)) {
            return 1;
        } else {
            return -1;
        }
    } else {
        return 0;
    }
}

// Prelude.Interfaces.Prelude.Interfaces.String implementation of Prelude.Interfaces.Ord, method compare

function Prelude__Interfaces__Prelude__Interfaces___64_Prelude__Interfaces__Ord_36_String_58__33_compare_58_0($_0_arg, $_1_arg){
    
    if((((($_0_arg == $_1_arg)) ? 1|0 : 0|0) === 0)) {
        
        if((((($_0_arg < $_1_arg)) ? 1|0 : 0|0) === 0)) {
            return 1;
        } else {
            return -1;
        }
    } else {
        return 0;
    }
}

// Prelude.Show.Exchange.OrderLineKey implementation of Prelude.Show.Show, method show

function Prelude__Show__Exchange___64_Prelude__Show__Show_36_OrderLineKey_58__33_show_58_0($_0_arg){
    
    return ("(p1:" + (Prelude__Show__primNumShow(null, $partial_0_1$prim_95__95_toStrBigInt(), $HC_0_0$Prelude__Show__Open, $_0_arg.$1) + ("p2:" + (Prelude__Show__primNumShow(null, $partial_0_1$prim_95__95_toStrBigInt(), $HC_0_0$Prelude__Show__Open, $_0_arg.$2) + ("line:" + (Prelude__Show__primNumShow(null, $partial_0_1$prim_95__95_toStrBigInt(), $HC_0_0$Prelude__Show__Open, $_0_arg.$3) + ("sku1:" + (Prelude__Show__primNumShow(null, $partial_0_1$prim_95__95_toStrBigInt(), $HC_0_0$Prelude__Show__Open, $_0_arg.$4) + ("sku2:" + (Prelude__Show__primNumShow(null, $partial_0_1$prim_95__95_toStrBigInt(), $HC_0_0$Prelude__Show__Open, $_0_arg.$5) + ("price_unit:" + Prelude__Show__primNumShow(null, $partial_0_1$prim_95__95_toStrBigInt(), $HC_0_0$Prelude__Show__Open, $_0_arg.$6))))))))))));
}

// {runMain_0}

function $_0_runMain(){
    return $JSRTS.force(Main__main($HC_0_0$TheWorld));
}

// {PE_insertFrom_2a38cce8_6}

function $_6_PE_95_insertFrom_95_2a38cce8($_0_lift, $_1_lift){
    
    return Data__SortedMap__insert(null, null, $_1_lift.$1, $_1_lift.$2, $_0_lift);
}

// {PE_match_3b7ca742_7}

function $_7_PE_95_match_95_3b7ca742($_0_lift, $_1_lift){
    
    
    if(Prelude__Interfaces__Language__JSON__String__Tokens___64_Prelude__Interfaces__Eq_36_JSONStringTokenKind_58__33__61__61__58_0($_1_lift.$1, $_0_lift)) {
        let $cg$3 = null;
        if(($_0_lift.type === 1)) {
            $cg$3 = Language__JSON__String__Tokens__charValue($_1_lift.$2);
        } else if(($_0_lift.type === 0)) {
            $cg$3 = $HC_0_0$MkUnit;
        } else if(($_0_lift.type === 2)) {
            $cg$3 = Language__JSON__String__Tokens__simpleEscapeValue($_1_lift.$2);
        } else {
            $cg$3 = Prelude__Chars__chr((parseInt((("0x" + ($JSRTS.prim_strSubstr((2), ((((new $JSRTS.jsbn.BigInteger(''+((($_1_lift.$2).length))))).intValue()|0)), ($_1_lift.$2))))))|0));
        }
        
        return new $HC_1_1$Prelude__Maybe__Just($cg$3);
    } else {
        return $HC_0_0$Prelude__Maybe__Nothing;
    }
}

// {PE_match_44e5df34_8}

function $_8_PE_95_match_95_44e5df34($_0_lift, $_1_lift){
    
    
    if(Prelude__Interfaces__Language__JSON__Tokens___64_Prelude__Interfaces__Eq_36_JSONTokenKind_58__33__61__61__58_0($_1_lift.$1, $_0_lift)) {
        let $cg$3 = null;
        if(($_0_lift.type === 0)) {
            $cg$3 = ($_1_lift.$2 == "true");
        } else if(($_0_lift.type === 5)) {
            $cg$3 = $HC_0_0$MkUnit;
        } else if(($_0_lift.type === 3)) {
            $cg$3 = $HC_0_0$MkUnit;
        } else if(($_0_lift.type === 1)) {
            $cg$3 = parseFloat($_1_lift.$2);
        } else if(($_0_lift.type === 4)) {
            $cg$3 = $HC_0_0$MkUnit;
        } else {
            const $cg$5 = Language__JSON__String__Lexer__lexString($_1_lift.$2);
            if(($cg$5.type === 1)) {
                $cg$3 = Language__JSON__String__Parser__parseString($cg$5.$1);
            } else {
                $cg$3 = $HC_0_0$Prelude__Maybe__Nothing;
            }
        }
        
        return new $HC_1_1$Prelude__Maybe__Just($cg$3);
    } else {
        return $HC_0_0$Prelude__Maybe__Nothing;
    }
}

// {Data.SortedMap.mergeWith:inserted:0_lam_117}

function $_117_Data__SortedMap__mergeWith_58_inserted_58_0_95_lam($_0_lift, $_1_lift, $_2_lift, $_3_lift){
    let $cg$1 = null;
    let $cg$2 = null;
    if(($_0_lift.type === 0)) {
        $cg$2 = $HC_0_0$Prelude__Maybe__Nothing;
    } else {
        $cg$2 = Data__SortedMap__treeLookup(null, null, $_0_lift.$1, null, $_2_lift.$1, $_0_lift.$2);
    }
    
    let $cg$3 = null;
    if(($cg$2.type === 1)) {
        $cg$3 = $_1_lift($cg$2.$1)($_2_lift.$2);
    } else {
        $cg$3 = $_2_lift.$2;
    }
    
    $cg$1 = new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$Builtins__MkPair($_2_lift.$1, $cg$3), $HC_0_0$Prelude__List__Nil);
    return Prelude__List___43__43_(null, $cg$1, $_3_lift);
}

// {Language.JSON.Parser.object:properties:0_lam_118}

function $_118_Language__JSON__Parser__object_58_properties_58_0_95_lam($_0_lift, $_1_lift){
    return new $HC_1_0$Text__Parser__Core__Empty(new $HC_2_0$Builtins__MkPair($_0_lift, $_1_lift));
}

// {Language.JSON.Parser.object:properties:0_lam_119}

function $_119_Language__JSON__Parser__object_58_properties_58_0_95_lam($_0_lift){
    return $partial_1_2$$_118_Language__JSON__Parser__object_58_properties_58_0_95_lam($_0_lift);
}

// {Language.JSON.Parser.object:properties:0_lam_120}

function $_120_Language__JSON__Parser__object_58_properties_58_0_95_lam($_0_lift, $_1_lift){
    return new $HC_3_6$Text__Parser__Core__SeqEat(false, Language__JSON__Parser__json(), new $JSRTS.Lazy((function(){
        return (function(){
            return $_119_Language__JSON__Parser__object_58_properties_58_0_95_lam($_0_lift);
        })();
    })));
}

// {Language.JSON.Parser.object:properties:0_lam_121}

function $_121_Language__JSON__Parser__object_58_properties_58_0_95_lam($_0_lift){
    return $partial_1_2$$_120_Language__JSON__Parser__object_58_properties_58_0_95_lam($_0_lift);
}

// {Language.JSON.Parser.object:properties:0_lam_122}

function $_122_Language__JSON__Parser__object_58_properties_58_0_95_lam($_0_lift){
    return new $HC_3_6$Text__Parser__Core__SeqEat(true, PE_95_match_95_44e5df34(new $HC_1_4$Language__JSON__Tokens__JTPunct($HC_0_1$Language__JSON__Tokens__Colon)), new $JSRTS.Lazy((function(){
        return (function(){
            return $_121_Language__JSON__Parser__object_58_properties_58_0_95_lam($_0_lift);
        })();
    })));
}

// {Language.JSON.Parser.object:properties:0_lam_123}

function $_123_Language__JSON__Parser__object_58_properties_58_0_95_lam(){
    return $partial_0_1$$_122_Language__JSON__Parser__object_58_properties_58_0_95_lam();
}

// {Text.Lexer.Core.tokenise:getCols:0_lam_124}

function $_124_Text__Lexer__Core__tokenise_58_getCols_58_0_95_lam($_0_lift){
    
    if((((($_0_lift === "\n")) ? 1|0 : 0|0) === 0)) {
        return true;
    } else {
        return false;
    }
}

// {Text.Lexer.Core.tokenise:getFirstToken:0_lam_125}

function $_125_Text__Lexer__Core__tokenise_58_getFirstToken_58_0_95_lam($_0_lift){
    return ($_0_lift === "\n");
}

// {Data.SortedMap.treeToList:treeToList':0_lam_126}

function $_126_Data__SortedMap__treeToList_58_treeToList_39__58_0_95_lam($_0_lift, $_1_lift, $_2_lift){
    return new $HC_2_1$Prelude__List___58__58_($_2_lift, Data__SortedMap__treeToList_58_treeToList_39__58_0(null, null, null, null, null, $_0_lift, $_1_lift));
}

// {Data.SortedMap.treeToList:treeToList':0_lam_128}

function $_128_Data__SortedMap__treeToList_58_treeToList_39__58_0_95_lam($_0_lift, $_1_lift, $_2_lift, $_3_lift){
    return new $HC_2_1$Prelude__List___58__58_($_3_lift, Data__SortedMap__treeToList_58_treeToList_39__58_0(null, null, null, null, null, $partial_2_3$$_126_Data__SortedMap__treeToList_58_treeToList_39__58_0_95_lam($_0_lift, $_1_lift), $_2_lift));
}

// {_Text.Parser.Core.doParse_with_52_lam_141}

function $_141__95_Text__Parser__Core__doParse_95_with_95_52_95_lam($_0_lift, $_1_lift, $_2_lift, $_3_lift, $_4_lift, $_5_lift, $_6_lift, $_7_lift, $_8_lift, $_9_lift, $_10_lift, $_11_lift, $_12_lift, $_13_lift){
    return $JSRTS.force($_9_lift);
}

// Prelude.Bits.b8ToHexString, getDigit

function Prelude__Bits__b8ToHexString_58_getDigit_58_0($_0_arg, $_1_arg){
    const $_2_in = $_1_arg;
    let $cg$1 = null;
    if((((($_2_in >= 0)) ? 1|0 : 0|0) === 0)) {
        $cg$1 = false;
    } else {
        $cg$1 = ($_2_in <= 9);
    }
    
    
    if($cg$1) {
        return (String.fromCharCode(("0").charCodeAt(0) + (Prelude__Chars__chr($_2_in)).charCodeAt(0)));
    } else {
        let $cg$3 = null;
        if((((($_2_in >= 10)) ? 1|0 : 0|0) === 0)) {
            $cg$3 = false;
        } else {
            $cg$3 = ($_2_in <= 15);
        }
        
        
        if($cg$3) {
            return (String.fromCharCode(("A").charCodeAt(0) + (Prelude__Chars__chr(($_2_in - 10))).charCodeAt(0)));
        } else {
            return "?";
        }
    }
}

// Language.JSON.Data.format, formatValue

function Language__JSON__Data__format_58_formatValue_58_0($_0_arg, $_1_arg, $_2_arg, $_3_arg, $_4_arg, $_5_arg){
    
    if(($_5_arg.type === 4)) {
        const $cg$5 = $_5_arg.$1;
        if(($cg$5.type === 1)) {
            return ("[\n" + (Language__JSON__Data__format_58_formatValue_58_0_58_formatValues_58_1(null, null, null, $_3_arg, $_4_arg, null, null, new $HC_2_1$Prelude__List___58__58_($cg$5.$1, $cg$5.$2), null) + (Prelude__Foldable__Prelude__List___64_Prelude__Foldable__Foldable_36_List_58__33_foldr_58_0(null, null, $partial_0_2$prim_95__95_strCons(), "", Prelude__List__replicate(null, $_3_arg, " ")) + "]")));
        } else if(($cg$5.type === 0)) {
            return "[]";
        } else {
            return Language__JSON__Data__stringify($_5_arg);
        }
    } else if(($_5_arg.type === 5)) {
        const $cg$3 = $_5_arg.$1;
        if(($cg$3.type === 1)) {
            return ("{\n" + (Language__JSON__Data__format_58_formatValue_58_0_58_formatProps_58_3(null, null, null, $_3_arg, $_4_arg, null, null, new $HC_2_1$Prelude__List___58__58_($cg$3.$1, $cg$3.$2), null) + (Prelude__Foldable__Prelude__List___64_Prelude__Foldable__Foldable_36_List_58__33_foldr_58_0(null, null, $partial_0_2$prim_95__95_strCons(), "", Prelude__List__replicate(null, $_3_arg, " ")) + "}")));
        } else if(($cg$3.type === 0)) {
            return "{}";
        } else {
            return Language__JSON__Data__stringify($_5_arg);
        }
    } else {
        return Language__JSON__Data__stringify($_5_arg);
    }
}

// Prelude.Chars.isHexDigit, hexChars

function Prelude__Chars__isHexDigit_58_hexChars_58_0($_0_arg){
    return new $HC_2_1$Prelude__List___58__58_("0", new $HC_2_1$Prelude__List___58__58_("1", new $HC_2_1$Prelude__List___58__58_("2", new $HC_2_1$Prelude__List___58__58_("3", new $HC_2_1$Prelude__List___58__58_("4", new $HC_2_1$Prelude__List___58__58_("5", new $HC_2_1$Prelude__List___58__58_("6", new $HC_2_1$Prelude__List___58__58_("7", new $HC_2_1$Prelude__List___58__58_("8", new $HC_2_1$Prelude__List___58__58_("9", new $HC_2_1$Prelude__List___58__58_("A", new $HC_2_1$Prelude__List___58__58_("B", new $HC_2_1$Prelude__List___58__58_("C", new $HC_2_1$Prelude__List___58__58_("D", new $HC_2_1$Prelude__List___58__58_("E", new $HC_2_1$Prelude__List___58__58_("F", $HC_0_0$Prelude__List__Nil))))))))))))))));
}

// Data.SortedMap.mergeWith, inserted

function Data__SortedMap__mergeWith_58_inserted_58_0($_0_arg, $_1_arg, $_2_arg, $_3_arg, $_4_arg){
    return Prelude__Foldable__Prelude__List___64_Prelude__Foldable__Foldable_36_List_58__33_foldr_58_0(null, null, $partial_2_4$$_117_Data__SortedMap__mergeWith_58_inserted_58_0_95_lam($_3_arg, $_2_arg), $HC_0_0$Prelude__List__Nil, Data__SortedMap__toList(null, null, $_4_arg));
}

// Language.JSON.Parser.object, properties

function Language__JSON__Parser__object_58_properties_58_0(){
    return Text__Parser__option(null, null, true, $HC_0_0$Prelude__List__Nil, Text__Parser__sepBy1(null, null, null, true, PE_95_match_95_44e5df34(new $HC_1_4$Language__JSON__Tokens__JTPunct($HC_0_0$Language__JSON__Tokens__Comma)), new $HC_3_6$Text__Parser__Core__SeqEat(true, Language__JSON__Parser__rawString(), new $JSRTS.Lazy((function(){
        return (function(){
            return $_123_Language__JSON__Parser__object_58_properties_58_0_95_lam();
        })();
    })))));
}

// Prelude.WellFounded.sizeAccessible, acc

function Prelude__WellFounded__sizeAccessible_58_acc_58_0($_0_arg, $_1_arg, $_2_arg, $_3_arg, $_4_arg, $_5_arg, $_6_z, $_7_zLTy){
    return $partial_6_8$Prelude__WellFounded__sizeAccessible_58_acc_58_0(null, null, null, null, null, null);
}

// Text.Lexer.Core.tokenise, getCols

function Text__Lexer__Core__tokenise_58_getCols_58_0($_0_arg, $_1_arg, $_2_arg, $_3_arg, $_4_arg, $_5_arg, $_6_arg, $_7_arg){
    const $cg$2 = Text__Lexer__Core__fspan($partial_0_1$$_124_Text__Lexer__Core__tokenise_58_getCols_58_0_95_lam(), (($_6_arg).split('').reverse().join('')));
    
    if(($cg$2.$2 === "")) {
        return ($_7_arg + (((new $JSRTS.jsbn.BigInteger(''+((($cg$2.$1).length))))).intValue()|0));
    } else {
        return (((new $JSRTS.jsbn.BigInteger(''+((($cg$2.$1).length))))).intValue()|0);
    }
}

// Text.Lexer.Core.tokenise, getFirstToken

function Text__Lexer__Core__tokenise_58_getFirstToken_58_0($_0_arg, $_1_arg, $_2_arg, $_3_arg, $_4_arg, $_5_arg, $_6_arg, $_7_arg){
    for(;;) {
        
        if(($_6_arg.type === 1)) {
            const $cg$3 = $_6_arg.$1;
            const $cg$5 = Text__Lexer__Core__takeToken($cg$3.$1, $_7_arg);
            if(($cg$5.type === 1)) {
                const $cg$7 = $cg$5.$1;
                let $cg$8 = null;
                if((((($cg$7.$1 == "")) ? 1|0 : 0|0) === 0)) {
                    $cg$8 = true;
                } else {
                    $cg$8 = false;
                }
                
                let $cg$9 = null;
                if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$8, true).type === 1)) {
                    $cg$9 = $HC_0_0$Prelude__List__Nil;
                } else {
                    let $cg$10 = null;
                    if((((($cg$7.$1.slice(1) == "")) ? 1|0 : 0|0) === 0)) {
                        $cg$10 = true;
                    } else {
                        $cg$10 = false;
                    }
                    
                    let $cg$11 = null;
                    if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$10, true).type === 1)) {
                        $cg$11 = $HC_0_0$Prelude__Strings__StrNil;
                    } else {
                        $cg$11 = new $HC_2_1$Prelude__Strings__StrCons($cg$7.$1.slice(1)[0], $cg$7.$1.slice(1).slice(1));
                    }
                    
                    $cg$9 = new $HC_2_1$Prelude__List___58__58_($cg$7.$1[0], _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$11));
                }
                
                return new $HC_1_1$Prelude__Maybe__Just(new $HC_2_0$Builtins__MkPair($cg$3.$2($cg$7.$1), new $HC_2_0$Builtins__MkPair(($_1_arg + ((Prelude__List__length(null, Prelude__List__filter(null, $partial_0_1$$_125_Text__Lexer__Core__tokenise_58_getFirstToken_58_0_95_lam(), $cg$9))).intValue()|0)), new $HC_2_0$Builtins__MkPair(Text__Lexer__Core__tokenise_58_getCols_58_0(null, null, null, null, null, null, $cg$7.$1, $_2_arg), $cg$7.$2))));
            } else {
                $_0_arg = null;
                $_1_arg = $_1_arg;
                $_2_arg = $_2_arg;
                $_3_arg = null;
                $_4_arg = null;
                $_5_arg = null;
                $_6_arg = $_6_arg.$2;
                $_7_arg = $_7_arg;
            }
        } else {
            return $HC_0_0$Prelude__Maybe__Nothing;
        }
    }
}

// Data.SortedMap.treeToList, treeToList'

function Data__SortedMap__treeToList_58_treeToList_39__58_0($_0_arg, $_1_arg, $_2_arg, $_3_arg, $_4_arg, $_5_arg, $_6_arg){
    for(;;) {
        
        if(($_6_arg.type === 1)) {
            $_0_arg = null;
            $_1_arg = null;
            $_2_arg = null;
            $_3_arg = null;
            $_4_arg = null;
            $_5_arg = $partial_2_3$$_126_Data__SortedMap__treeToList_58_treeToList_39__58_0_95_lam($_5_arg, $_6_arg.$3);
            $_6_arg = $_6_arg.$1;
        } else if(($_6_arg.type === 2)) {
            $_0_arg = null;
            $_1_arg = null;
            $_2_arg = null;
            $_3_arg = null;
            $_4_arg = null;
            $_5_arg = $partial_3_4$$_128_Data__SortedMap__treeToList_58_treeToList_39__58_0_95_lam($_5_arg, $_6_arg.$5, $_6_arg.$3);
            $_6_arg = $_6_arg.$1;
        } else {
            return $_5_arg(new $HC_2_0$Builtins__MkPair($_6_arg.$1, $_6_arg.$2));
        }
    }
}

// Prelude.Show.Prelude.Show.List a implementation of Prelude.Show.Show, method show, show'

function Prelude__Show__Prelude__Show___64_Prelude__Show__Show_36_List_32_a_58__33_show_58_0_58_show_39__58_0($_0_arg, $_1_arg, $_2_arg, $_3_arg, $_4_arg){
    let $tco$$_3_arg = $_3_arg;
    for(;;) {
        
        if(($_4_arg.type === 1)) {
            
            if(($_4_arg.$2.type === 0)) {
                return ($_3_arg + $_2_arg($_4_arg.$1));
            } else {
                $tco$$_3_arg = ($_3_arg + ($_2_arg($_4_arg.$1) + ", "));
                $_0_arg = null;
                $_1_arg = null;
                $_2_arg = $_2_arg;
                $_3_arg = $tco$$_3_arg;
                $_4_arg = $_4_arg.$2;
            }
        } else {
            return $_3_arg;
        }
    }
}

// Language.JSON.Data.format, formatValue, formatValues

function Language__JSON__Data__format_58_formatValue_58_0_58_formatValues_58_1($_0_arg, $_1_arg, $_2_arg, $_3_arg, $_4_arg, $_5_arg, $_6_arg, $_7_arg, $_8_arg){
    
    let $cg$2 = null;
    if((Prelude__List__nonEmpty(null, $_7_arg.$2).type === 1)) {
        $cg$2 = "\n";
    } else {
        $cg$2 = (",\n" + Language__JSON__Data__format_58_formatValue_58_0_58_formatValues_58_1(null, null, null, $_3_arg, $_4_arg, null, null, $_7_arg.$2, null));
    }
    
    return ((Prelude__Foldable__Prelude__List___64_Prelude__Foldable__Foldable_36_List_58__33_foldr_58_0(null, null, $partial_0_2$prim_95__95_strCons(), "", Prelude__List__replicate(null, $_3_arg.add($_4_arg), " ")) + Language__JSON__Data__format_58_formatValue_58_0(null, null, null, $_3_arg.add($_4_arg), $_4_arg, $_7_arg.$1)) + $cg$2);
}

// Language.JSON.Data.format, formatValue, formatProp

function Language__JSON__Data__format_58_formatValue_58_0_58_formatProp_58_3($_0_arg, $_1_arg, $_2_arg, $_3_arg, $_4_arg, $_5_arg, $_6_arg, $_7_arg){
    
    return ((Prelude__Foldable__Prelude__List___64_Prelude__Foldable__Foldable_36_List_58__33_foldr_58_0(null, null, $partial_0_2$prim_95__95_strCons(), "", Prelude__List__replicate(null, $_3_arg.add($_4_arg), " ")) + (Language__JSON__Data__showString($_7_arg.$1) + ": ")) + Language__JSON__Data__format_58_formatValue_58_0(null, null, null, $_3_arg.add($_4_arg), $_4_arg, $_7_arg.$2));
}

// Language.JSON.Data.format, formatValue, formatProps

function Language__JSON__Data__format_58_formatValue_58_0_58_formatProps_58_3($_0_arg, $_1_arg, $_2_arg, $_3_arg, $_4_arg, $_5_arg, $_6_arg, $_7_arg, $_8_arg){
    
    let $cg$2 = null;
    if((Prelude__List__nonEmpty(null, $_7_arg.$2).type === 1)) {
        $cg$2 = "\n";
    } else {
        $cg$2 = (",\n" + Language__JSON__Data__format_58_formatValue_58_0_58_formatProps_58_3(null, null, null, $_3_arg, $_4_arg, null, null, $_7_arg.$2, null));
    }
    
    return (Language__JSON__Data__format_58_formatValue_58_0_58_formatProp_58_3(null, null, null, $_3_arg, $_4_arg, null, null, $_7_arg.$1) + $cg$2);
}

// Language.JSON.Data.stringify, stringifyValues

function Language__JSON__Data__stringify_58_stringifyValues_58_4($_0_arg, $_1_arg){
    
    if(($_1_arg.type === 1)) {
        const $cg$3 = $_1_arg.$2;
        let $cg$2 = null;
        if(($cg$3.type === 1)) {
            $cg$2 = ("," + Language__JSON__Data__stringify_58_stringifyValues_58_4(null, $_1_arg.$2));
        } else {
            $cg$2 = "";
        }
        
        return (Language__JSON__Data__stringify($_1_arg.$1) + $cg$2);
    } else {
        return "";
    }
}

// Language.JSON.Data.stringify, stringifyProps

function Language__JSON__Data__stringify_58_stringifyProps_58_5($_0_arg, $_1_arg){
    
    if(($_1_arg.type === 1)) {
        const $cg$3 = $_1_arg.$1;
        let $cg$2 = null;
        $cg$2 = (Language__JSON__Data__showString($cg$3.$1) + (":" + Language__JSON__Data__stringify($cg$3.$2)));
        const $cg$5 = $_1_arg.$2;
        let $cg$4 = null;
        if(($cg$5.type === 1)) {
            $cg$4 = ("," + Language__JSON__Data__stringify_58_stringifyProps_58_5(null, $_1_arg.$2));
        } else {
            $cg$4 = "";
        }
        
        return ($cg$2 + $cg$4);
    } else {
        return "";
    }
}

// with block in Data.String.Extra.index

function _95_Data__String__Extra__index_95_with_95_18($_0_arg, $_1_arg, $_2_arg){
    for(;;) {
        
        if(($_0_arg.type === 1)) {
            
            if($_1_arg.equals((new $JSRTS.jsbn.BigInteger(("0"))))) {
                return new $HC_1_1$Prelude__Maybe__Just($_0_arg.$1);
            } else {
                const $_5_in = $_1_arg.subtract((new $JSRTS.jsbn.BigInteger(("1"))));
                $_0_arg = $_0_arg.$2;
                $_1_arg = $_5_in;
                $_2_arg = null;
            }
        } else {
            return $HC_0_0$Prelude__Maybe__Nothing;
        }
    }
}

// with block in Prelude.Strings.unpack

function _95_Prelude__Strings__unpack_95_with_95_36($_0_arg, $_1_arg){
    
    if(($_1_arg.type === 1)) {
        let $cg$2 = null;
        if((((($_1_arg.$2 == "")) ? 1|0 : 0|0) === 0)) {
            $cg$2 = true;
        } else {
            $cg$2 = false;
        }
        
        let $cg$3 = null;
        if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$2, true).type === 1)) {
            $cg$3 = $HC_0_0$Prelude__Strings__StrNil;
        } else {
            $cg$3 = new $HC_2_1$Prelude__Strings__StrCons($_1_arg.$2[0], $_1_arg.$2.slice(1));
        }
        
        return new $HC_2_1$Prelude__List___58__58_($_1_arg.$1, _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$3));
    } else {
        return $HC_0_0$Prelude__List__Nil;
    }
}

// with block in Text.Parser.Core.doParse

function _95_Text__Parser__Core__doParse_95_with_95_52($_0_arg, $_1_arg, $_2_arg, $_3_arg, $_4_arg, $_5_arg, $_6_arg){
    
    if(($_6_arg.type === 8)) {
        const $cg$27 = _95_Text__Parser__Core__doParse_95_with_95_52(false, null, null, $_3_arg, $_4_arg, $_6_arg.$1, $_6_arg.$3);
        if(($cg$27.type === 1)) {
            return new $HC_2_1$Text__Parser__Core__EmptyRes($_0_arg, $cg$27.$2);
        } else if(($cg$27.type === 0)) {
            
            if($cg$27.$1) {
                return new $HC_1_0$Text__Parser__Core__Failure($_0_arg);
            } else {
                return Text__Parser__Core__weakenRes(null, null, $_6_arg.$1, null, null, $_0_arg, _95_Text__Parser__Core__doParse_95_with_95_52(false, null, null, $_3_arg, $_4_arg, $_6_arg.$2, $_6_arg.$4));
            }
        } else {
            return new $HC_4_2$Text__Parser__Core__NonEmptyRes($cg$27.$1, $_0_arg, $cg$27.$3, $cg$27.$4);
        }
    } else if(($_6_arg.type === 5)) {
        
        if((!$_5_arg)) {
            return new $HC_2_1$Text__Parser__Core__EmptyRes(true, $HC_0_0$MkUnit);
        } else {
            return new $HC_1_0$Text__Parser__Core__Failure(true);
        }
    } else if(($_6_arg.type === 3)) {
        
        if((!$_5_arg)) {
            
            if(($_3_arg.type === 1)) {
                return new $HC_1_0$Text__Parser__Core__Failure($_0_arg);
            } else if(($_3_arg.type === 0)) {
                return new $HC_2_1$Text__Parser__Core__EmptyRes($_0_arg, $HC_0_0$MkUnit);
            } else {
                return new $HC_1_0$Text__Parser__Core__Failure(true);
            }
        } else {
            return new $HC_1_0$Text__Parser__Core__Failure(true);
        }
    } else if(($_6_arg.type === 0)) {
        
        if((!$_5_arg)) {
            return new $HC_2_1$Text__Parser__Core__EmptyRes($_0_arg, $_6_arg.$1);
        } else {
            return new $HC_1_0$Text__Parser__Core__Failure(true);
        }
    } else if(($_6_arg.type === 4)) {
        
        if(($_3_arg.type === 1)) {
            return new $HC_1_0$Text__Parser__Core__Failure($_0_arg);
        } else if(($_3_arg.type === 0)) {
            return new $HC_1_0$Text__Parser__Core__Failure($_0_arg);
        } else {
            return new $HC_1_0$Text__Parser__Core__Failure(true);
        }
    } else if(($_6_arg.type === 6)) {
        
        if($_5_arg) {
            const $cg$16 = _95_Text__Parser__Core__doParse_95_with_95_52($_0_arg, null, null, $_3_arg, $_4_arg, true, $_6_arg.$2);
            if(($cg$16.type === 0)) {
                return new $HC_1_0$Text__Parser__Core__Failure($cg$16.$1);
            } else {
                const $cg$18 = _95_Text__Parser__Core__doParse_95_with_95_52($cg$16.$2, null, null, $cg$16.$4, $_4_arg($cg$16.$4)(Text__Parser__Core__shorter(null, $cg$16.$4, $cg$16.$1)), $_6_arg.$1, $_141__95_Text__Parser__Core__doParse_95_with_95_52_95_lam($_0_arg, $_1_arg, $_2_arg, $_3_arg, $_4_arg, $_5_arg, $_6_arg, $_6_arg.$1, $_6_arg.$2, $_6_arg.$3, $cg$16.$1, $cg$16.$2, $cg$16.$3, $cg$16.$4)($cg$16.$3));
                if(($cg$18.type === 1)) {
                    return new $HC_4_2$Text__Parser__Core__NonEmptyRes($cg$16.$1, $cg$18.$1, $cg$18.$2, $cg$16.$4);
                } else if(($cg$18.type === 0)) {
                    return new $HC_1_0$Text__Parser__Core__Failure($cg$18.$1);
                } else {
                    const $cg$20 = $cg$16.$4;
                    return new $HC_4_2$Text__Parser__Core__NonEmptyRes(Prelude__List___43__43_(null, $cg$16.$1, new $HC_2_1$Prelude__List___58__58_($cg$20.$1, $cg$18.$1)), $cg$18.$2, $cg$18.$3, $cg$18.$4);
                }
            }
        } else {
            return new $HC_1_0$Text__Parser__Core__Failure(true);
        }
    } else if(($_6_arg.type === 7)) {
        const $cg$7 = _95_Text__Parser__Core__doParse_95_with_95_52($_0_arg, null, null, $_3_arg, $_4_arg, $_6_arg.$1, $_6_arg.$3);
        if(($cg$7.type === 1)) {
            const $cg$13 = _95_Text__Parser__Core__doParse_95_with_95_52($cg$7.$1, null, null, $_3_arg, $_4_arg, $_6_arg.$2, $_6_arg.$4($cg$7.$2));
            if(($cg$13.type === 1)) {
                return new $HC_2_1$Text__Parser__Core__EmptyRes($cg$13.$1, $cg$13.$2);
            } else if(($cg$13.type === 0)) {
                return new $HC_1_0$Text__Parser__Core__Failure($cg$13.$1);
            } else {
                return new $HC_4_2$Text__Parser__Core__NonEmptyRes($cg$13.$1, $cg$13.$2, $cg$13.$3, $cg$13.$4);
            }
        } else if(($cg$7.type === 0)) {
            return new $HC_1_0$Text__Parser__Core__Failure($cg$7.$1);
        } else {
            const $cg$9 = _95_Text__Parser__Core__doParse_95_with_95_52($cg$7.$2, null, null, $cg$7.$4, $_4_arg($cg$7.$4)(Text__Parser__Core__shorter(null, $cg$7.$4, $cg$7.$1)), $_6_arg.$2, $_6_arg.$4($cg$7.$3));
            if(($cg$9.type === 1)) {
                return new $HC_4_2$Text__Parser__Core__NonEmptyRes($cg$7.$1, $cg$9.$1, $cg$9.$2, $cg$7.$4);
            } else if(($cg$9.type === 0)) {
                return new $HC_1_0$Text__Parser__Core__Failure($cg$9.$1);
            } else {
                const $cg$11 = $cg$7.$4;
                return new $HC_4_2$Text__Parser__Core__NonEmptyRes(Prelude__List___43__43_(null, $cg$7.$1, new $HC_2_1$Prelude__List___58__58_($cg$11.$1, $cg$9.$1)), $cg$9.$2, $cg$9.$3, $cg$9.$4);
            }
        }
    } else if(($_6_arg.type === 1)) {
        
        if($_5_arg) {
            
            if(($_3_arg.type === 1)) {
                const $cg$5 = $_6_arg.$1($_3_arg.$1);
                if(($cg$5.type === 1)) {
                    return new $HC_4_2$Text__Parser__Core__NonEmptyRes($HC_0_0$Prelude__List__Nil, $_0_arg, $cg$5.$1, $_3_arg.$2);
                } else {
                    return new $HC_1_0$Text__Parser__Core__Failure($_0_arg);
                }
            } else if(($_3_arg.type === 0)) {
                return new $HC_1_0$Text__Parser__Core__Failure($_0_arg);
            } else {
                return new $HC_1_0$Text__Parser__Core__Failure(true);
            }
        } else {
            return new $HC_1_0$Text__Parser__Core__Failure(true);
        }
    } else {
        return new $HC_1_0$Text__Parser__Core__Failure(true);
    }
}


$_0_runMain();
}.call(this))